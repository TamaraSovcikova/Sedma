interface ShowOnlyEvenProps {
  number: number;
}

export function ShowOnlyEven(props:ShowOnlyEvenProps){
  if (props.number % 2 === 0) {
    return <div>Click count (only even) {props.number}</div>
  }
  return <div>' '</div>;
}