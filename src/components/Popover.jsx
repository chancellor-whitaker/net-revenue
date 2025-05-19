import { usePopover } from "../hooks/usePopover";

export const Popover = ({ label = "Label", children }) => {
  const { popover, isOpen, open } = usePopover();

  return (
    <div className="position-relative">
      <button
        className={["btn btn-primary", isOpen ? "active" : null]
          .filter((element) => element)
          .join(" ")}
        onClick={open}
        type="button"
      >
        {label}
      </button>
      {isOpen && (
        <div
          className="position-absolute shadow"
          style={{ zIndex: 1070 }}
          ref={popover}
        >
          {children}
        </div>
      )}
    </div>
  );
};
