import Image from 'next/image';
import illustration from '/public/home-illustration.png';
import github from '/public/github.svg';
import check from '/public/check.svg';
import checkPrimary from '/public/check-primary.svg';
export default function Home() {

  return (
    <div className="col">
      <div className="row align-center title">
        <Image src="/icon-lg.svg" width="105" height="98" alt="" />
        <h1 data-testid="title">Poker Planning</h1>
      </div>
      <div className="welcome-box col">
        <div className="subtitle">
          <Image src={check} alt="check" width="24" height="24" />
          user-friendly
          <a href="https://github.com/moby-it/planning-poker" target="_blank">
            <Image src={github} alt="github" />
            <u>open-sourced</u>
          </a>
          <span>
            <Image
              src={checkPrimary}
              className="primary"
              alt="check"
            />
            free forerer
          </span>
        </div>
        <span>
          We got tired of searching for free solution for doing{" "}
          <strong>
            <u>Scrum Poker Planning</u>
          </strong>
          , so we decided to solve the issue ourselves and open-source it.
        </span>
        <div style={{ 'alignSelf': 'center' }} data-testid="start-here">
          {/* <Button action={() => navigate("prejoin?create=true")}>
                <span>Start Here</span>
              </Button> */}
        </div>
      </div>
      <Image
        className="home-illustration"
        src={illustration}
        alt="planning illustration"
      />
    </div>
  );
}
