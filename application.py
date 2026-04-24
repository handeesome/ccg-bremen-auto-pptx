import os
import io
import logging
import tempfile
import zipfile
import shutil
import uuid
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, after_this_request
from functions.generate_pptx import generate_pptx
from functions.generate_lyrics_pptx import generate_lyrics_pptx
from functions.import_song_slides import extract_song_slides, extract_song_slides_from_path, sanitize_song_name, cleanup_paths, extract_slide_one_audio
import datetime
import requests
from bs4 import BeautifulSoup

# AWS requires the Flask app to be named "application"
application = Flask(__name__)
ENABLE_GOOGLE_DRIVE = False
BATCH_ROOT_NAME = 'song-import-batches'
SONG_SLOT_ROOT_NAME = 'song-slot-imports'


def direct_get(url, timeout=15):
    session = requests.Session()
    session.trust_env = False
    return session.get(
        url,
        timeout=timeout,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
        },
    )



def get_latest_mod_time(directory):
    """ Get the most recent modification date (YYYY-MM-DD) in the project directory. """
    latest_time = 0
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                mod_time = os.path.getmtime(file_path)
                latest_time = max(latest_time, mod_time)  # Track the latest modification
            except FileNotFoundError:
                continue  # Skip files that were deleted
    return datetime.datetime.fromtimestamp(latest_time).strftime('%Y-%m-%d')  # Only Year-Month-Day

@application.route('/', methods=['GET'])
def index():
    last_modified = get_latest_mod_time(os.getcwd())  # Scan all project files

    if ENABLE_GOOGLE_DRIVE:
        logging.info("Google Drive indexing is enabled.")
    else:
        logging.info("Google Drive features are temporarily disabled.")
    
    return render_template('index.html', last_modified=last_modified)

@application.route('/song-import', methods=['GET'])
def song_import():
    return render_template('song_import.html')


@application.route('/song-diy', methods=['GET'])
def song_diy():
    return render_template('song_diy.html')


def get_song_import_batch_root():
    temp_root = os.path.join(os.getcwd(), 'static', 'temp')
    os.makedirs(temp_root, exist_ok=True)
    batch_root = os.path.join(temp_root, BATCH_ROOT_NAME)
    os.makedirs(batch_root, exist_ok=True)
    return batch_root


def get_song_slot_import_root():
    temp_root = os.path.join(os.getcwd(), 'static', 'temp')
    os.makedirs(temp_root, exist_ok=True)
    slot_root = os.path.join(temp_root, SONG_SLOT_ROOT_NAME)
    os.makedirs(slot_root, exist_ok=True)
    return slot_root


def is_safe_song_slot_audio_path(path_value):
    if not path_value:
        return False
    try:
        resolved_path = Path(path_value).resolve()
        slot_root = Path(get_song_slot_import_root()).resolve()
        resolved_path.relative_to(slot_root)
        return resolved_path.is_file()
    except (OSError, ValueError):
        return False


def get_song_import_batch_dirs(batch_id):
    batch_root = get_song_import_batch_root()
    batch_dir = os.path.join(batch_root, batch_id)
    return {
        'root': batch_root,
        'batch': batch_dir,
        'output': os.path.join(batch_dir, 'output'),
        'work': os.path.join(batch_dir, 'work'),
    }


def ensure_song_import_batch(batch_id):
    dirs = get_song_import_batch_dirs(batch_id)
    if not os.path.isdir(dirs['batch']):
        raise FileNotFoundError("Batch not found")
    os.makedirs(dirs['output'], exist_ok=True)
    os.makedirs(dirs['work'], exist_ok=True)
    return dirs


def reserve_output_path(output_dir, original_name):
    stem = sanitize_song_name(original_name or 'song')
    candidate = f"{stem}.pptx"
    candidate_path = os.path.join(output_dir, candidate)
    if not os.path.exists(candidate_path):
        return stem

    suffix = 2
    while True:
        candidate = f"{stem}-{suffix}.pptx"
        candidate_path = os.path.join(output_dir, candidate)
        if not os.path.exists(candidate_path):
            return f"{stem}-{suffix}"
        suffix += 1

@application.route("/get_lyrics", methods=["GET"])
def get_lyrics():
    baseURL = "https://www.zanmei.ai"
    searchURL = baseURL + "/search/song/"
    song_input = request.args.get("song")  # Get songInput from the frontend
    if not song_input:
        logging.error("Lyrics request missing song input.")
        return jsonify({"error": "Missing song input"}), 400

    searchURL = searchURL + song_input
    try:
        response = requests.get(searchURL, timeout=10)  # Fetch page
        response.raise_for_status()  # Raise error if status code is not 200

        soup = BeautifulSoup(response.text, "html.parser")
        songs = soup.select(".mainbody table tr")
        for idx, song in enumerate(songs, 1):
            first_link = song.select_one("a")  # Get the first <a> inside the table
            href = first_link["href"] if first_link else "No link found"
            songURL = baseURL + href
            response = requests.get(songURL, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            lrc_text = soup.find(id="lyric_text")
            if not lrc_text:
                continue
            lrc_text = lrc_text.text
            lrc_link = soup.find(lambda tag: tag.name == "a" and tag.text.strip() == "下载LRC")
            if lrc_link:
                lrc_url = baseURL + lrc_link["href"]  # Get LRC file URL
                print(f"Downloading LRC from: {lrc_url}")

                # Define save path
                save_dir = "static/temp"
                os.makedirs(save_dir, exist_ok=True)  # Ensure directory exists
                save_path = os.path.join(save_dir, "lyrics.lrc")

                # Download LRC file
                response = requests.get(lrc_url, timeout=10)
                if response.status_code == 200:
                    with open(save_path, "wb") as file:
                        file.write(response.content)
                    print(f"LRC file saved to {save_path}")
                    logging.info(f"LRC file saved to {save_path}")
                    return jsonify({"message": "Success", "lrc_text": lrc_text}), 200
                else:
                    print(f"Failed to download LRC file. Status code: {response.status_code}")
                    logging.error(f"Failed to download LRC file. Status code: {response.status_code}")
                    return jsonify({"error": "Failed to download LRC file"}), 500
            else:
                print("下载LRC link not found.")
        return jsonify({"error": "LRC link not found"}), 404
    except requests.exceptions.RequestException as e:
        print(e)
        logging.error(f"RequestException: {e}")
        return jsonify({"error": f"Unable to reach zanmei.ai: {e.__class__.__name__}"}), 502

@application.route('/api/ccg-bremen', methods=['GET'])
def get_ccg_bremen_content():
    url = "https://ccg-bremen.de/default.php"

    try:
        response = direct_get(url, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch CCG Bremen page: {e}")
        return jsonify({"error": f"Unable to reach CCG Bremen: {e.__class__.__name__}"}), 502

    soup = BeautifulSoup(response.text, "html.parser")

    jin_ju = None
    tong_xun_items = []

    jin_ju_heading = next(
        (h2 for h2 in soup.select("h2") if "金句" in h2.get_text(" ", strip=True)),
        None,
    )
    if jin_ju_heading:
        jin_ju_paragraphs = []
        for sibling in jin_ju_heading.find_next_siblings():
            if getattr(sibling, "name", None) == "h2":
                break
            if getattr(sibling, "name", None) == "p":
                text = sibling.get_text(" ", strip=True)
                if text:
                    jin_ju_paragraphs.append(text)

        if len(jin_ju_paragraphs) > 1:
            jin_ju = jin_ju_paragraphs[1]
        elif jin_ju_paragraphs:
            jin_ju = jin_ju_paragraphs[0]

    tong_xun_heading = next(
        (h2 for h2 in soup.select("h2") if "教会通讯" in h2.get_text(" ", strip=True)),
        None,
    )
    if tong_xun_heading:
        tong_xun = tong_xun_heading.find_next("ol")
        if tong_xun:
            tong_xun_items = [
                li.get_text(" ", strip=True)
                for li in tong_xun.select("li")
                if li.get_text(strip=True)
            ]

    if not jin_ju and not tong_xun_items:
        return jsonify({"error": "Unable to find expected sections on CCG Bremen page"}), 502

    return jsonify({
        "jinJu": jin_ju,
        "activities": tong_xun_items,
    }), 200


@application.route('/api/song-slots/import', methods=['POST'])
def import_song_slots():
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    slot_root = get_song_slot_import_root()
    source_dir = tempfile.mkdtemp(prefix='song-slot-src-', dir=slot_root)
    temp_paths = [source_dir]
    imported = []

    try:
        for uploaded_file in files[:4]:
            if not uploaded_file or not uploaded_file.filename:
                continue

            original_name = uploaded_file.filename
            source_path = os.path.join(source_dir, original_name)
            uploaded_file.save(source_path)

            extracted = extract_song_slides_from_path(source_path, original_name)
            slides = extracted.get('slides') or []
            pages = [
                str(slide.get('text', '')).strip()
                for slide in slides
                if str(slide.get('text', '')).strip()
            ]
            if not pages:
                return jsonify({
                    "error": f"{original_name} does not contain any readable lyric slides"
                }), 400

            audio_path = extract_slide_one_audio(source_path, slot_root)
            if audio_path:
                temp_paths.append(audio_path)

            imported.append({
                "originalName": original_name,
                "suggestedTitle": extracted.get('suggestedTitle') or sanitize_song_name(original_name),
                "pages": pages,
                "audioPath": audio_path,
                "audioCopied": bool(audio_path),
            })

        if not imported:
            return jsonify({"error": "No valid .pptx files were uploaded"}), 400

        return jsonify({"files": imported}), 200
    finally:
        cleanup_paths([source_dir])

@application.route('/process-form', methods=['POST'])
def process_form():
    temp_audio_paths = []
    try:
        data = request.json  # Parse JSON
        logging.info(f"Data received: {data}")
        if not data:
            logging.error("No JSON received")
            return jsonify({"error": "No JSON received"}), 400

        for song_id in ("song1", "song2", "song3", "song4"):
            audio_path = data.get(f"{song_id}AudioPath")
            safe_audio_path = audio_path if is_safe_song_slot_audio_path(audio_path) else None
            data[f"{song_id}AudioPath"] = safe_audio_path
            if safe_audio_path:
                temp_audio_paths.append(safe_audio_path)

        fileName = generate_pptx("./docs/template.pptx", data)  # Get saved filename
        cleanup_paths(temp_audio_paths)
        return jsonify({"message": "Success", "fileName": fileName}), 200
    except Exception as e:
        cleanup_paths(temp_audio_paths)
        logging.error(f"Error in process_form: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400
    
@application.route('/submit-song', methods=['POST'])
def submit_song():
    try:
        data = request.json or {}
        pages = data.get('pages')
        song_name = (data.get('songName') or '').strip()

        if not pages:
            return jsonify({"error": "Missing song pages"}), 400
        if not song_name:
            return jsonify({"error": "Missing song name"}), 400

        fileName = generate_lyrics_pptx('./docs/empty.pptx', pages, song_name)
        return jsonify({"message": "Success", "fileName": fileName}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@application.route('/api/song-import/extract', methods=['POST'])
def extract_song_import():
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    extracted_files = []
    for uploaded_file in files:
        if not uploaded_file or not uploaded_file.filename:
            continue
        try:
            extracted_files.append(extract_song_slides(uploaded_file))
        except Exception as e:
            return jsonify({
                "error": f"Failed to process {uploaded_file.filename}: {str(e)}"
            }), 400

    if not extracted_files:
        return jsonify({"error": "No valid files uploaded"}), 400

    return jsonify({"files": extracted_files}), 200

@application.route('/api/song-import/export', methods=['POST'])
def export_song_import():
    payload = request.json or {}
    files = payload.get('files') or []
    if not files:
        return jsonify({"error": "No extracted slides provided"}), 400

    temp_root = os.path.join(os.getcwd(), 'static', 'temp')
    os.makedirs(temp_root, exist_ok=True)
    output_dir = tempfile.mkdtemp(prefix='song-import-', dir=temp_root)
    generated_paths = []

    try:
        for item in files:
            title = sanitize_song_name(item.get('originalName') or 'song')
            slides = item.get('slides') or []
            slide_texts = [str(slide.get('text', '')).strip() for slide in slides if str(slide.get('text', '')).strip()]

            if not slide_texts:
                continue

            file_name = generate_lyrics_pptx('./docs/empty.pptx', slide_texts, title, output_dir=output_dir)
            generated_paths.append(os.path.join(output_dir, file_name))

        if not generated_paths:
            cleanup_paths([output_dir])
            return jsonify({"error": "No slides with text were available to export"}), 400

        @after_this_request
        def cleanup(response):
            cleanup_paths(generated_paths + [output_dir])
            return response

        if len(generated_paths) == 1:
            output_path = generated_paths[0]
            with open(output_path, 'rb') as f:
                file_data = f.read()
            file_stream = io.BytesIO(file_data)
            file_stream.seek(0)
            return send_file(
                file_stream,
                as_attachment=True,
                download_name=os.path.basename(output_path),
                mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
            for path in generated_paths:
                archive.write(path, arcname=os.path.basename(path))
        zip_buffer.seek(0)

        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name='converted-song-pptx.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        cleanup_paths(generated_paths + [output_dir])
        return jsonify({"error": str(e)}), 500

@application.route('/api/song-import/convert', methods=['POST'])
def convert_song_import():
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    temp_root = os.path.join(os.getcwd(), 'static', 'temp')
    os.makedirs(temp_root, exist_ok=True)
    output_dir = tempfile.mkdtemp(prefix='song-import-', dir=temp_root)
    source_dir = tempfile.mkdtemp(prefix='song-import-src-', dir=temp_root)
    generated_paths = []
    temp_audio_paths = []

    try:
        for uploaded_file in files:
            if not uploaded_file or not uploaded_file.filename:
                continue

            original_name = uploaded_file.filename
            source_path = os.path.join(source_dir, original_name)
            uploaded_file.save(source_path)

            extracted = extract_song_slides_from_path(source_path, original_name)
            slides = extracted.get('slides') or []
            slide_texts = [str(slide.get('text', '')).strip() for slide in slides if str(slide.get('text', '')).strip()]

            if not slide_texts:
                continue

            audio_path = extract_slide_one_audio(source_path, source_dir)
            if audio_path:
                temp_audio_paths.append(audio_path)

            title = sanitize_song_name(original_name or 'song')
            file_name = generate_lyrics_pptx(
                './docs/empty.pptx',
                slide_texts,
                title,
                output_dir=output_dir,
                audio_path=audio_path,
            )
            generated_paths.append(os.path.join(output_dir, file_name))

        if not generated_paths:
            cleanup_paths(temp_audio_paths + [output_dir, source_dir])
            return jsonify({"error": "No slides with text were available to export"}), 400

        @after_this_request
        def cleanup(response):
            cleanup_paths(generated_paths + temp_audio_paths + [output_dir, source_dir])
            return response

        if len(generated_paths) == 1:
            output_path = generated_paths[0]
            with open(output_path, 'rb') as f:
                file_data = f.read()
            file_stream = io.BytesIO(file_data)
            file_stream.seek(0)
            return send_file(
                file_stream,
                as_attachment=True,
                download_name=os.path.basename(output_path),
                mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
            for path in generated_paths:
                archive.write(path, arcname=os.path.basename(path))
        zip_buffer.seek(0)

        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name='converted-song-pptx.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        cleanup_paths(generated_paths + temp_audio_paths + [output_dir, source_dir])
        return jsonify({"error": str(e)}), 500


@application.route('/api/song-import/batch-start', methods=['POST'])
def song_import_batch_start():
    batch_id = uuid.uuid4().hex
    dirs = get_song_import_batch_dirs(batch_id)
    os.makedirs(dirs['output'], exist_ok=True)
    os.makedirs(dirs['work'], exist_ok=True)
    return jsonify({"batchId": batch_id}), 200


@application.route('/api/song-import/batch-chunk', methods=['POST'])
def song_import_batch_chunk():
    batch_id = request.form.get('batchId', '').strip()
    files = request.files.getlist('files')
    if not batch_id:
        return jsonify({"error": "Missing batch id"}), 400
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    try:
        dirs = ensure_song_import_batch(batch_id)
    except FileNotFoundError:
        return jsonify({"error": "Batch not found"}), 404

    processed = []
    failed = []

    for uploaded_file in files:
        temp_paths = []
        try:
            if not uploaded_file or not uploaded_file.filename:
                continue

            original_name = uploaded_file.filename
            source_fd, source_path = tempfile.mkstemp(
                prefix='src-',
                suffix='.pptx',
                dir=dirs['work'],
            )
            os.close(source_fd)
            uploaded_file.save(source_path)
            temp_paths.append(source_path)

            extracted = extract_song_slides_from_path(source_path, original_name)
            slides = extracted.get('slides') or []
            slide_texts = [
                str(slide.get('text', '')).strip()
                for slide in slides
                if str(slide.get('text', '')).strip()
            ]

            if not slide_texts:
                failed.append({
                    "name": original_name,
                    "error": "No slides with text were available to export",
                })
                cleanup_paths(temp_paths)
                continue

            audio_path = extract_slide_one_audio(source_path, dirs['work'])
            if audio_path:
                temp_paths.append(audio_path)

            reserved_title = reserve_output_path(dirs['output'], original_name)
            file_name = generate_lyrics_pptx(
                './docs/empty.pptx',
                slide_texts,
                reserved_title,
                output_dir=dirs['output'],
                audio_path=audio_path,
            )
            processed.append({
                "name": original_name,
                "outputName": file_name,
                "slideCount": len(slides),
                "audioCopied": bool(audio_path),
            })
        except Exception as e:
            failed.append({
                "name": getattr(uploaded_file, 'filename', 'unknown'),
                "error": str(e),
            })
        finally:
            cleanup_paths(temp_paths)

    return jsonify({
        "processed": processed,
        "failed": failed,
        "processedCount": len(processed),
        "failedCount": len(failed),
    }), 200


@application.route('/api/song-import/batch-finalize', methods=['POST'])
def song_import_batch_finalize():
    payload = request.json or {}
    batch_id = (payload.get('batchId') or '').strip()
    if not batch_id:
        return jsonify({"error": "Missing batch id"}), 400

    try:
        dirs = ensure_song_import_batch(batch_id)
    except FileNotFoundError:
        return jsonify({"error": "Batch not found"}), 404

    output_files = []
    for entry in sorted(os.listdir(dirs['output'])):
        path = os.path.join(dirs['output'], entry)
        if os.path.isfile(path):
            output_files.append(path)

    if not output_files:
        cleanup_paths([dirs['batch']])
        return jsonify({"error": "No converted files available"}), 400

    @after_this_request
    def cleanup(response):
        shutil.rmtree(dirs['batch'], ignore_errors=True)
        return response

    if len(output_files) == 1:
        output_path = output_files[0]
        with open(output_path, 'rb') as f:
            file_data = f.read()
        file_stream = io.BytesIO(file_data)
        file_stream.seek(0)
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=os.path.basename(output_path),
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in output_files:
            archive.write(path, arcname=os.path.basename(path))
    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name='converted-song-pptx.zip',
        mimetype='application/zip'
    )

@application.route('/download/<fileName>', methods=['GET'])
def download_pptx(fileName):
    try:
        pptx_path = os.path.join("static/temp", fileName)
        
        # Read the file into memory and close it immediately
        with open(pptx_path, 'rb') as f:
            file_data = f.read()
        
        # Create a BytesIO object from the file data
        file_stream = io.BytesIO(file_data)
        file_stream.seek(0)  # Reset the stream position to the beginning
        
        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(pptx_path):
                    os.remove(pptx_path)
                    print(f"Successfully deleted: {pptx_path}")
                else:
                    print(f"File not found: {pptx_path}")
                    logging.error(f"File not found: {pptx_path}")
            except Exception as e:
                print(f"Error deleting file: {e}")
                logging.error(f"Error deleting file: {e}")
            return response
        
        # Send the in-memory file as a response
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=fileName,
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
    
    except Exception as e:
        logging.error(f"Error in download_pptx: {str(e)}")
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    application.run()
