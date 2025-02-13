import { useNavigate } from 'react-router-dom';

export function RulesPage() {
  const navigate = useNavigate();

  //Will navigate player back to the landing page
  const handleReturn = () => navigate('/');

  return (
    <div className="container mt-5 p-0">
      <div className="row justify-content-center p-0">
        <div className=" col-lg-8 col-md-10 p-2">
          <button
            className="btn btn-secondary returnButton"
            onClick={handleReturn}
          >
            <i
              className="fas fa-arrow-left"
              style={{ fontSize: '20px', color: 'black' }}
            ></i>
          </button>
          <h1 style={{ fontSize: '60px' }} className="mb-4 text-center">
            Sedma Rules
          </h1>
          <div className="mb-4">
            <h3 className="font-weight-bold">
              <i className="fas fa-play"></i> Play
            </h3>
            <p>
              The player who created the table leads to the first trick, and the
              others play a card in turn.
            </p>
            <p>After all have played a card, the first player can:</p>
            <ul style={{ fontSize: '15px', fontStyle: 'italic' }}>
              <li>
                End the trick, won by the last player matching the first card or
                a seven.
              </li>
              <li>Continue the trick with a matching card or a seven.</li>
            </ul>
            <p>
              The trick continues until a stop or all players play all cards.
              The winner collects the cards.
            </p>
            <p>After re-dealing cards, the winner starts a new trick.</p>
            <p>When the deck runs out, play continues with remaining cards.</p>
          </div>

          <div className="mb-4">
            <h3 className="font-weight-bold">
              <i className="fas fa-trophy"></i> Scoring
            </h3>
            <p>
              After all cards have been played, collected points get calculated,
              earning 10 points for each ace or ten they have in their tricks,
              plus a extra 10 points for the team which won the last deal, for a
              total of 90 points in the game.
            </p>
            <ul style={{ fontSize: '15px', fontStyle: 'italic' }}>
              <li>
                If no team has all 90 points, the player or team with the most
                points wins 1 stake.
              </li>
              <li>
                A team that wins all 90 points but not all the tricks wins 2
                stakes.
              </li>
              <li>If a team wins all the cards, they win 3 stakes.</li>
            </ul>
            <p>
              You play until the stake goal set by the creator of the game is
              met
            </p>
          </div>
          <div className="mb-4">
            <h3 className="font-weight-bold">
              <i className="fas fa-trophy"></i> Example Game
            </h3>
            <p>
              The players are N(orth), E(ast), S(outh), and W(est), and the
              cards are abbreviated to A, K, O, U, 10, 9, 8, 7. North begins the
              first trick.
            </p>
            <p>
              N: 9, E: 10, S: U, W: 9, N: 9, E: 7, S: 8, W: 10. North decides to
              continue for a second round because West is winning, but East has
              a 7 and takes the trick, and West is able to give her partner
              another 10. North has no more 9's or 7's so has to stop. Everyone
              draws cards. East won the trick so starts the next one.
            </p>
            <p>
              E: A, S: 7, W: A, N: K. East is satisfied with this and stops.
              Everyone draws a card. West won so begins the next trick.
            </p>
          </div>
          <div className="mb-4">
            <h3 className="font-weight-bold">
              <i className="fas fa-splotch"></i> Our Special Twist
            </h3>
            <p>
              We like to make our sedma games fun. One way of doing that is with
              pesonalised looks.
            </p>
            <h4>
              We use a crown to symbolise the player who currently owns the pile
            </h4>
            <p>
              Below is an example of a game, which had just begun, we are the
              creator of the table, hence we are the one to begin and therefore
              also own the pile pesonalised looks.
            </p>
            <img
              src="/assets/crown-example.png"
              alt="crown example"
              className="mb-5"
              style={{ width: '60%', alignItems: 'center' }}
            />
            <h4>We use sunglasses to symbolise who's turn it is to play</h4>
            <p>
              Below is an example of a game, Player 4 has started the round off,
              my playing an eight, now, we have the sunglasses, meaning it is
              our turn to pick a card to play.
            </p>
            <img
              src="/assets/sunglasses-example.png"
              alt="sunglasses example"
              className="mb-5"
              style={{ width: '60%', alignItems: 'center' }}
            />
          </div>
          <button
            className="btn border-white "
            onClick={() => window.scrollTo(0, 0)}
          >
            <i className="fas fa-arrow-up" style={{ color: 'white' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
