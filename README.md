# Poker Planning

https://poker-planning.net/

Poker planning is a method of estimating effort complexity within Agile teams. It focuses on removing biases with a goal of describing team velocity through a small statistical analysis rather than human intuition.

You can read more about this methodology on [Wikipedia](https://en.wikipedia.org/wiki/Planning_poker)

# So why another app for Poker Planning?

As a team we were searching for an app to do some poker planning and were always stopped by paywalls. This is why we decided to solve the problem ourselves, [host it](https://poker-planning.net/) and open-source it.

## Quick Start

As mentioned [we are hosting this app](https://poker-planning.net/) **for free** for as long as we can sustain it.

However, if you want to run the app locally follow these 3 steps:

1. Make sure you have [docker installed](https://docs.docker.com/get-docker/)
2. Open a terminal in the project root and run `./scripts/run.sh`.
3. App should be available at `localhost:3000`.

# Licence

We create this simple poker planning app as a first step of providing something of value to the community. Anyone you are free to take it and modify to your needs since it's licenced under **Apache 2.0**.
# How to Contribute

We are glad that you are reached this section. Before providing some guidelines on how to contribute, let's go briefly over the tech stack.

## Tech stack

The application consists of a simple [Go](https://go.dev/) web api and a Front End UI created with [SolidJS](https://www.solidjs.com/). While our experience lies heavily in the JavaScript (NodeJS, Angular, Typescript) ecosystem, we always like to try new technologies.

*Any PR that suggests improvements in code quality and stability of the product is always appreciated.*

## Contribution guidelines

### Requirements

In case you are working with windows, we suggest working inside a Windows Subsystem Linux environment (WSL). On how to install wsl read more [here](https://learn.microsoft.com/en-us/windows/wsl/install).

To spin up the stack you need:

1. [Go](https://go.dev/) installed on your machine. Minimun version v1.20.2
2. Install [make](https://www.gnu.org/software/make/) if not already included in your system.
3. Install [Node.js](https://nodejs.org/en). Minimum version LTS

Inside the scripts folder there is a bunch of conveniece scripts, to help you test your changes before you create your Pull Request. The main one is `test-all.sh` We highly suggest you do so.

## Privacy and Open Source

We undestand that when planning information might include sensitive data from a company perspective.
For this reason we decided:
1. To create an stateless app with no database. Everything is persisted in memory and lost when a room closes.
2. We don't ask you of any names, either room names or task names. We trust that you do this work yourself.
3. We also decided to open source our app under **Apache Licence** so that you have the option for you to self-host it and extend it/modify it to fit your needs.

So if you are a privacy freak like us, you can host this yourself. If not, **we guarantee that we use exactly as much data as the app need to provide its features.**
## Licence

Moby IT does not claim any ownership on the idea of Agile Planning Poker. As mentioned in the [planningpoker.com](https://www.planningpoker.com/), the idea was popularized by Mike Cohn, Founding Member and Owner of [Mountain Goat Software](https://www.mountaingoatsoftware.com/).

Moby IT only aims to provide an open source and free solution to teams that want to use this method to do planning. The software is licenced under [Apache Licence, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)

---

<h3 align="center" style="display:flex; align-items:center; gap:1rem; justify-content:center;">
<img src="https://moby-it.com/favicon.ico" width="50"/>
Build by Moby IT
<img src="https://moby-it.com/favicon.ico" width="50"/>

</h3>
