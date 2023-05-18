export const Loader = ({ tabs }: { tabs: string[] }) => {
  return (
    <div>
      {tabs.map((tab) => (
        <span>{tab}</span>
      ))}
    </div>
  );
};
