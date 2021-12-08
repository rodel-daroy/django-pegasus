FROM python:3.7-slim-buster
FROM node:14.16-buster-slim
EXPOSE 8000
COPY . /
WORKDIR /
ENV run="python3 manage.py runserver 0.0.0.0:8000"
RUN apt-get update
RUN apt-get install libpq-dev gcc python3-pip  python3-tk libcurl4-openssl-dev libssl-dev  -y
RUN pip3 install -r requirements.txt
RUN npm i
RUN npm run build
RUN python3 manage.py collectstatic --no-input
RUN rm -rf /static/
RUN rm -rf /assets/
RUN rm -rf /node_modules/
CMD ${run}