# Findybot Particle Photon Code

Findybot uses a [Particle Photon](https://docs.particle.io/photon/) microcontroller to receive and display storage query animiations on the LED strips.

## Photon Setup

Follow the instructions on https://setup.particle.io/ to connect your Photon to the Particl.io dashboard.

Particle offers a variety of options when it comes to writing, building, and deploying code. For this project I am using [Visual Studio Code](https://code.visualstudio.com/) as my IDE along with the [Particle Workbench](https://www.particle.io/workbench/) extension to handle builds and deployments locally.

### Particle Workbench

- Install VS Code, and the Particle Workbench extension.
- Open a new VS Code instance with the `Photon` folder as the project root.
- Login to Particle Workbench: `particle login`
- Configure for Device
  - Select the option in the Workbench dashboard or search for `particle configure` and follow the prompts:
  - Select the `photon/project.properties` file if prompted
  - Select the Device OS version (currently using `1.2.1`)
  - Select the device type `Photon`
  - Enter your Photon's serial number

### Wiring Diagram

This project follows the original FindyBot3000 wiring diagram found on Instructable:

https://www.instructables.com/id/FindyBot3000-a-Voice-Controlled-Organizer/

Here is the wiring diagram from those instructions:

![Wiring Diagram](https://cdn.instructables.com/ORIG/FF9/M8AF/JTYN8D6M/FF9M8AFJTYN8D6M.png?auto=webp&frame=1&width=1024&height=1024&fit=bounds&md=1554173521)

## Build Project

- Select `Local compile` in the Workbench dashboard or search for `particle compile` and select `Particle: Compile application (local)`
  - Note: The first time building for a given platform / Device OS version can take a few minutes.

## Deploy to Photon

- Select `Cloud flash` in the Workbench dashboard or search for `particle flash` and select `Particle: Cloud Flash`