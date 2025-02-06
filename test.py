import pythoncom
import win32com.client

# Initialize PowerPoint application
pythoncom.CoInitialize()
ppt_app = win32com.client.Dispatch("PowerPoint.Application")
ppt_app.Visible = 1

# Open the presentation
ppt_path = r"C:\\Users\ducenhan\Desktop\\auto-pptx\\ccg-bremen-auto-pptx\\2024-10-06.pptx"
presentation = ppt_app.Presentations.Open(ppt_path)

# Define the output PDF path
# pdf_path = r"C:\\Users\ducenhan\Desktop\\auto-pptx\\ccg-bremen-auto-pptx\\2024-10-06.pdf"

# Save the presentation as PDF
# presentation.SaveAs(pdf_path, 32)  # 32 is the constant for saving as PDF
# presentation.Presentations.Add()
# Close the presentation
# presentation.Close()

# Quit PowerPoint application
# ppt_app.Quit()

print("Presentation converted to PDF successfully.")
