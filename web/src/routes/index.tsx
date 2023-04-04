import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import { Header } from "~/components/header/header";
import { Button } from "../components/button/button";
import "./index.css";
const Home: Component = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <div class="col home">
        <div class="row align-center title">
          <img src="/icon-lg.svg" width="105" height="98" alt="" srcset="" />
          <h1 data-testid="title">Poker Planning</h1>
        </div>
        <div class="welcome-box col">
          <div class="subtitle">
            <img src="/check.svg" alt="check" srcset="" />
            <span>
              user-friendly
            </span>
            <a href="https://github.com/moby-it/planning-poker" target="_blank">
              <img src="/github.svg" alt="github" srcset="" />
              <u>open-sourced</u>
            </a>
            <span>
              <img
                src="/check-primary.svg"
                class="primary"
                alt="check"
                srcset=""
              />
              free forever
            </span>
          </div>
          <div>
            We got tired of searching for free solution for doing{" "}
            <strong class="bold">
              <u>Scrum Poker Planning</u>
            </strong>
            , so we decided to solve the issue ourselves and open-source it.
          </div>
          <div style="align-self:center;" data-testid="start-here">
            <Button action={() => navigate("/prejoin?create=true")}>
              <span>Start Here</span>
            </Button>
          </div>
        </div>
        <img
          class="home-illustration"
          src="/home-illustration.png"
          alt="planning illustration"
        />
      </div>
    </>
  );
};
export default Home;
