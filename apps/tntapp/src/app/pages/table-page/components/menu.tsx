interface MenuProps {
  menuOpen: boolean;
  openMenu: () => void;
  toggleChat: () => void;
  unopenedMessage: number;
  onDisconnect: () => void;
}

export function Menu(props: MenuProps) {
  return (
    <div className="top-right-menu">
      <div
        className={`icon ${props.menuOpen ? 'active' : ''}`}
        onClick={props.openMenu}
      >
        <i className="fas fa-ellipsis-v"></i>
      </div>
      {props.menuOpen && (
        <div className="dropdown-menu">
          <div className="menu-item">
            <i id="chat" className="fas fa-comment" onClick={props.toggleChat}>
              Chat
            </i>
            {props.unopenedMessage > 0 && (
              <div className="message-count">{props.unopenedMessage}</div>
            )}
          </div>
          <div className="menu-item">
            <i
              id="disconnect"
              className="fas fa-sign-out-alt"
              onClick={props.onDisconnect}
            >
              Quit
            </i>
          </div>
        </div>
      )}
    </div>
  );
}
