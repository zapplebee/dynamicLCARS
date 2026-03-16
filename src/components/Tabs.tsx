import type { ReactNode } from "react";

type TabsProps = {
  children: ReactNode;
};

function Tabs({ children }: TabsProps) {
  return <div className="lcars-tabs">{children}</div>;
}

export default Tabs;
