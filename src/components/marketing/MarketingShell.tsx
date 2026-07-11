import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

type MarketingShellProps = {
  children: React.ReactNode;
};

const MarketingShell = ({ children }: MarketingShellProps) => {
  return (
    <>
      <SiteHeader variant="marketing" />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
};

export default MarketingShell;
