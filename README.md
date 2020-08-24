# Findybot (Alexa and AWS)

## A findybot implementation using Alexa and AWS.

Findybot is a voice-controlled organizer. This project will keep a database of the quantity and types of items stored in the cubbies of an organizer rack. Using LED strips, it can illumnate cubbies to help with storing and finding items.

The original FindyBot 3000 (link below) utilized Google Assistant, IFTTT, and Azure Functions. As a learning oportunity I have reimagined the project using Amazon Alexa and AWS Lambda Functions.

See the original FindyBot3000 instructable here: 

https://www.instructables.com/id/FindyBot3000-a-Voice-Controlled-Organizer/

The FindyBot3000 source code can be found here:

https://github.com/Inventor22/FindyBot3000

## Project Implementation

- Amazon Alexa for voice control
  - Custom Alexa Skill
- AWS
  - RDS database (Postgres)
  - Lambda functions containing app logic
  - Lambda function containing Alexa Skill Logic
- Particle Photon embedded wireless controller for LED display
- WS2812 LED strip

## Project Layout

- Alexa: contains the interaction model definition for the Alexa Skill
- Database: contains the SQL setup script for the Postgres database
- Lambda: contains the Lambda functions
- Photon: contains the source code for the Photon embedded controller

## Project Setup and Deployment

For setup and deployment instructions, see the embedded Readme file for within each service's folder.