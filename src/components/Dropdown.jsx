import { usePopover } from "../hooks/usePopover";

export const Dropdown = ({ onItemClick, children, active, field, list }) => {
  const { popover, isOpen, open } = usePopover();

  const allActive = active.size === list.length;

  return (
    <div className="dropdown">
      <button
        className={[
          `btn btn-${allActive ? "secondary" : "warning"} dropdown-toggle`,
          isOpen ? "active" : null,
        ]
          .filter((element) => element)
          .join(" ")}
        onClick={open}
        type="button"
      >
        {children ? children : field}
      </button>
      {isOpen && (
        <ul
          className="dropdown-menu show overflow-y-scroll shadow"
          style={{ maxHeight: 250 }}
          ref={popover}
        >
          <li>
            <button
              onClick={() => onItemClick({ field, list })}
              className="dropdown-item icon-link"
              type="button"
            >
              {allActive ? (
                <svg
                  className="bi bi-check-square-fill"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  height={16}
                  width={16}
                >
                  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="bi bi-square"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  height={16}
                  width={16}
                >
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                </svg>
              )}
              All
            </button>
          </li>
          {list.map(({ value, label }) => (
            <li key={value}>
              <button
                onClick={() => onItemClick({ field, value, list })}
                className="dropdown-item icon-link"
                type="button"
              >
                {active.has(value) ? (
                  <svg
                    className="bi bi-check-square-fill"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    height={16}
                    width={16}
                  >
                    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="bi bi-square"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    height={16}
                    width={16}
                  >
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                  </svg>
                )}
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
