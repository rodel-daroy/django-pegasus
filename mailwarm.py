from chattingtransformer import ChattingGPT2
import psycopg2
from mail.settings import *

NUM_EMAILS = 1000

print("Connecting to DB...")

conn = psycopg2.connect(
    host=DATABASES['default']['HOST'],
    database=DATABASES['default']['NAME'],
    port=DATABASES['default']['PORT'],
    user=DATABASES['default']['USER'],
    password=DATABASES['default']['PASSWORD'])

print("DB connected")

model_name = "gpt2"
gpt2 = ChattingGPT2(model_name)

cur = conn.cursor()
total_generated = 0

for i in range(0, NUM_EMAILS):
    text = "Fruits"
    subject = gpt2.generate_text(text, min_length=10, max_length=20)
    content = gpt2.generate_text(text, min_length=100, max_length=200)

    subject = subject.replace("\n", " ")[:100]
    content = content[:1024]

    try:
        cur.execute("""INSERT INTO mailaccounts_warmingmailtemplate (subject, content) VALUES (%s, %s)""", (subject, content) )
        conn.commit()
    except Exception as e:
        continue

    print(f"{i+1}/{NUM_EMAILS} done")
    total_generated += 1

print(f"{total_generated} templates are generated!!!")

cur.close()
conn.close() 