const Tabs: React.FC<{
  tabs: string[];
  selectedTab: string | undefined;
  setSelectedTab: (tab: string) => void;
}> = ({ tabs, selectedTab, setSelectedTab }) => {
  const select = (page: string) => {
    setSelectedTab(page);
  };

  return (
    <div className="Tabs">
      <ul className="nav">
        {tabs.map((x) => (
          <li
            key={x}
            className={`nav-item${selectedTab === x ? " active" : ""}`}
            onClick={() => select(x)}
          >
            <span className="nav-link" aria-current="page">
              {x}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tabs;
