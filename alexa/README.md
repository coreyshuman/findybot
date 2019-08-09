# Create Lambda Function
see [Lambda Readme](../lambda/README.md)
- Keep Tab Open (Needed in next section)

# Create New Skill
- Open Alexa Developer Console: https://developer.amazon.com/alexa/console/ask
- Click Create Skill
    - Enter Skill Name
    - Choose Model: Custom
    - Choose Host: Provision Your Own
- Click Create Skill
- Start from Scratch

- Interaction Model > Intents (Side Menu) > Add Intent
    - Create Custom: Enter Name
    - Sample Utterances: Add utterances
        - Or use JSON Editor and copy InteractionModel.json
    - Click Save Model
    - Click Build Model

- Endpoint (Side Menu)
    - Service Endpoint Type: AWS Lambda ARN
    - Copy ARN from Lambda Tab
    - Click Save Endpoints
    - Copy Skill ID and enter in Lambda Tab > Alexa Skills Kit > Skill Id Verification

- Test (Top Menu)
    - Select Development
        - If this fails, make sure you built the model.
    - Type/ Say utterances to test the application



