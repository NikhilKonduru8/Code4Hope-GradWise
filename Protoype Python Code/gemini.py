from google import genai
from rich.console import Console
from rich.markdown import Markdown

client = genai.Client(api_key="AIzaSyAzUhIVNpyjc4tx3K6wKTYiIn6OIExr_4E")

text = input("What is your question for your counselor: ")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Please help this user go through their question regarding the college admission process and other general things around their problem unless the question is off-topic and not-relevant, then respond that it is not relevant: " + text
)

console = Console()
md = Markdown(response.text)
console.print(md)

