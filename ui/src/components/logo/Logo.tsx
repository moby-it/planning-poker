import { useNavigate } from '@solidjs/router';
import './logo.css';
export function Logo() {
  const navigate = useNavigate();

  return <div class="logo"
    style={{ cursor: "pointer" }}
    onClick={() => navigate("/")}>
    <img src="favicon.ico" width="26" alt="" />
    <h4>Poker Planning</h4>
  </div>;
}