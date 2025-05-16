import { usePopover } from "../hooks/usePopover";

export const Dropdown = ({ onItemClick, active, field, list }) => {
  const { popover, isOpen, open } = usePopover();

  return (
    <div className="dropdown">
      <button
        className={[
          "btn btn-secondary dropdown-toggle",
          isOpen ? "active" : null,
        ]
          .filter((element) => element)
          .join(" ")}
        onClick={open}
        type="button"
      >
        {field}
      </button>
      {isOpen && (
        <ul
          className="dropdown-menu show overflow-y-scroll"
          style={{ height: 300 }}
          ref={popover}
        >
          {list.map(({ value, label }) => (
            <li key={value}>
              <button
                className={[
                  "dropdown-item",
                  active.has(value) ? "active" : null,
                ]
                  .filter((element) => element)
                  .join(" ")}
                onClick={() => onItemClick({ field, value })}
                type="button"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
