from google import genai
from rich.console import Console
from rich.markdown import Markdown
from PyPDF2 import PdfReader

reader = PdfReader("example.pdf")
for page in reader.pages:
    text = page.extract_text()

client = genai.Client(api_key="AIzaSyAzUhIVNpyjc4tx3K6wKTYiIn6OIExr_4E")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Evaluate this user's essay and give them feedback: " + text
)

console = Console()
md = Markdown(response.text)
console.print(md)

