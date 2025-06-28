from google import genai
from rich.console import Console
from rich.markdown import Markdown

client = genai.Client(api_key="APIKEY")

text = input("What area do you live in and what is your income bracket? ")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Give this user a recommended college/university based on their area and income bracket povided here: " + text
)

console = Console()
md = Markdown(response.text)
console.print(md)
