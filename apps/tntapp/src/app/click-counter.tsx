import { useState } from "react";
import { ShowOnlyEven } from "./show-only-even";

export function ClickCounter() {
  const [clickCount, setClickCount] = useState(0);

  const increment = () => setClickCount(clickCount + 1);

  return (
    <div>
      <button onClick={increment}>Click Me</button>
      <ShowOnlyEven number={clickCount} />
    </div>
  );
}