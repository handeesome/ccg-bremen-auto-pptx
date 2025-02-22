from google.oauth2 import service_account
from googleapiclient.discovery import build
import json
import os
from datetime import datetime, timedelta

def get_gdrive_folder_structure(service_account_file, folder_id, temp_folder):
    """
    Fetches the folder structure from Google Drive and saves it as JSON in the specified temp folder.
    Returns the folder structure as a dictionary.
    """
    # Scope for Google Drive API
    SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
    
    # Authenticate and create the Drive API client
    credentials = service_account.Credentials.from_service_account_file(
        service_account_file, scopes=SCOPES)
    service = build('drive', 'v3', credentials=credentials)
    
    # Store the folder structure
    folder_structure = {}
    
    def list_files_in_folder(folder_id):
        """Lists all files in the specified Google Drive folder."""
        query = f"'{folder_id}' in parents"
        files = []
        page_token = None

        while True:
            results = service.files().list(
                q=query,
                spaces='drive',
                fields='nextPageToken, files(id, name, mimeType, parents, modifiedTime)',
                pageToken=page_token
            ).execute()
            items = results.get('files', [])
            files.extend(items)
            page_token = results.get('nextPageToken')
            if not page_token:
                break

        return files

    def list_all_files_recursively(folder_id, parent_id=None):
        """Recursively lists files in the folder and tracks parent-child relationships."""
        nonlocal folder_structure

        # Initialize the parent folder if not already done
        if folder_id not in folder_structure:
            folder_structure[folder_id] = {
                'name': 'Root' if parent_id is None else '',
                'files': [],
                'subfolders': []
            }

        # List current folder's files and subfolders
        files = list_files_in_folder(folder_id)
        for file in files:
            if file['mimeType'] == 'application/vnd.google-apps.folder':
                # If it's a subfolder, track its parent and recursively get its contents
                folder_structure[folder_id]['subfolders'].append(file['id'])
                folder_structure[file['id']] = {
                    'name': file['name'],
                    'files': [],
                    'subfolders': []
                }
                print(f"Entering subfolder: {file['name']}")
                list_all_files_recursively(file['id'], parent_id=folder_id)
            else:
                # If it's a file, store it under the current folder
                folder_structure[folder_id]['files'].append({
                    'id': file['id'],
                    'name': file['name'],
                    'mimeType': file['mimeType'],
                    'modifiedTime': file['modifiedTime']
                })

    def save_structure_to_temp():
        """Saves the folder structure to a temp folder as JSON for future reference."""
        if not os.path.exists(temp_folder):
            os.makedirs(temp_folder)

        temp_file = os.path.join(temp_folder, 'GDriveSongs.json')
        with open(temp_file, 'w') as f:
            json.dump(folder_structure, f, indent=4)

        print(f"Folder structure saved to {temp_file}")

    # Check if the temp file exists and is not older than 7 days
    file_path = os.path.join(temp_folder, 'GDriveSongs.json')
    if os.path.exists(file_path):
        modified_time = datetime.fromtimestamp(os.path.getmtime(file_path))
        difference = datetime.now() - modified_time
        if difference < timedelta(days=7):
            print("Using cached folder structure.")
        else:
            print("Cached structure is outdated, fetching again.")
            list_all_files_recursively(folder_id)
            save_structure_to_temp()
    else:
        print("No cached structure found, fetching from Google Drive.")
        list_all_files_recursively(folder_id)
        save_structure_to_temp()

    return folder_structure
