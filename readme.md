# WEB322 Project (Fall 2023)

I declare that this assignment is my own work in accordance with the Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source
(including web sites) or distributed to other students.

Student Name  : Jigar Patel <br>
Student Email : jdpatel22@myseneca.ca <br>
Course/Section: WEB322/NEE

## Project URLs
GitHub Repo   : https://github.com/jpatel98/web322-jdpatel22 <br>
Cyclic URL    : https://jade-sparkling-rhinoceros.cyclic.app

## Environment Variables
The project needs the following environment variables to run locally. They can be copied from `.env.example` file.

`
MAILGUN_DOMAIN="YOUR_MAILGUN_DOMAIN"
`

`
MAILGUN_API_KEY="YOUR_MAILGUN_API_KEY"
`

`
MONGODB_CONNECTION_STRING="YOUR_MONGODB_STRING"
`

`
CLIENT_SESSION_SECRET_KEY="your_secret"
`

## Note to professor
Due to [mailgun limitation](https://help.mailgun.com/hc/en-us/articles/217531258-Authorized-Recipients) of sending emails to authorized recipients only, I have added nickroma.seneca@gmail.com as one of the recipient. Even after adding authorized recipient, Seneca's email is blocking the mailgun's provided domain for phising.