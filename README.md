# Mailerrize

## Onboarding Video:

https://www.loom.com/share/bb28dd0d0c5d47e799699df57aa867e9

## SaaS Overview:

https://www.loom.com/share/b5130cdf21b943ebb93e25450b3bfd5d

## Docs:

- Backend Specifications: https://www.notion.so/MailSaaS-Backend-Specifications-8f1b7ea3ab5d4d0cab824d3649522b74
- System Design: https://www.notion.so/MailSaaS-System-Design-f40b671eff5141d9a7b486308c43a9d0

## Database Design (Dated: 25 April 2021)

![plot](./custom_apps.png)

## Rules

- Do your best
- No sloppy work
- Pull from dev daily
- Always test your changes before making a pull request to dev
- Never push to master

- Feel free to create your own

## Installation

````bash
npm install
npm run dev-watch
pip install -r requirements.txt
python manage.py runserver

## Running Celery

Celery can be used to run background tasks. To run it you can use:

```bash
celery -A mail worker -l INFO
````