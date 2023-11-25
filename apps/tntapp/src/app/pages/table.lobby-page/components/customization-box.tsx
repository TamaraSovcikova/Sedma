interface CustomizationBoxProps {
  selectedColor: string;
  onColorChange: (message: string) => void;
}

export function CustomizationBox(props: CustomizationBoxProps) {
  const colorOptions = [
    { id: 'red', name: 'Red' },
    { id: 'blue', name: 'Blue' },
    { id: 'green', name: 'Green' },
    { id: 'yellow', name: 'Yellow' },
    { id: 'gold', name: 'Gold' },
    { id: 'purple', name: 'Purple' },
    { id: 'orange', name: 'Orange' },
    { id: 'pink', name: 'Pink' },
    { id: 'teal', name: 'Teal' },
    { id: 'violet', name: 'Violet' },
    { id: 'cyan', name: 'Cyan' },
    { id: 'lime', name: 'Lime' },
    { id: 'indigo', name: 'Indigo' },
    { id: 'brown', name: 'Brown' },
    { id: 'grey', name: 'Grey' },
    { id: 'black', name: 'Black' },
  ];

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-12">
        <p>SELECT A SHIRT COLOR:</p>
        <div className="color-options">
          {colorOptions.map((color) => (
            <label key={color.id} className="color-option">
              <input
                type="checkbox"
                value={color.id}
                checked={props.selectedColor === color.id}
                onChange={() => props.onColorChange(color.id)}
              />
              {color.name}
              <span
                className="color-box"
                style={{ backgroundColor: color.id }}
              ></span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
