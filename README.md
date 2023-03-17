# Poker Planning

https://poker-planning.net/

Poker planning is a method of estimating effort complexity within Agile teams. It focuses on removing biases with a goal of describing team velocity through a small statistical analysis rather than human intuition.

You can read more about this methodology on [Wikipedia](https://en.wikipedia.org/wiki/Planning_poker):

# So why another app for Poker Planning?

As a team we were searching for an app to do some poker planning and were always stopped by paywalls. This is why we decided to solve the problem ourselves, [host it](https://poker-planning.net/) and open-source it.

## Quick Start

1. Make sure you have [docker installed](https://docs.docker.com/get-docker/)
2. Navigate inside this repo and run `docker compose up`. If you want to detach your terminal window from the `docker compose up` you can run `docker compose up -d`
3. Navigate to `localhost:3000` to see the front end app locally.
## Work with the front end Locally
1. Open a bash terminal inside this folder.
2. Execute `run.dev.sh` script.
3. You can find the app in `localhost:3000`.
4. Any change inside the ui folder should be **automatically** reflected on the site.
## Tech stack

The application consists of a simple [Go](https://go.dev/) web api and a Front End UI created with [SolidJS](https://www.solidjs.com/). While our experience lies heavily in the JavaScript (NodeJS, Angular, Typescript) ecosystem, we always like to try new technologies.

### Application Structure

The application is fairly simple. There is no database layer, every piece of information is saved in web api's memory. There is no persistent logging outsite of the container logs.

## Privary and Open Source

We undestand that when planning information might include sensitive data from a company perspective. This is why we decided to open source our app under **Apache Licence** so that you have the option for you to self-host it so that you have **complete control of your data**.
