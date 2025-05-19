import { RemoteComponent } from "./RemoteComponent";

export const Wrapper = ({
  url = "https://irserver2.eku.edu/libraries/remote/wrapper.cjs",
  ...rest
}) => <RemoteComponent url={url} {...rest} />;
