function Dashboard() {

    const stats = [
      {
        title: "Total Customers",
        value: 25,
      },
      {
        title: "Open Conversations",
        value: 12,
      },
      {
        title: "New Leads",
        value: 8,
      },
      {
        title: "AI Actions",
        value: 6,
      },
    ];
  
    return (
      <div>
  
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Business overview</p>
        </div>
  
        <div className="stats-grid">
  
          {stats.map((stat) => (
            <div
              className="stat-card"
              key={stat.title}
            >
              <p>{stat.title}</p>
              <h2>{stat.value}</h2>
            </div>
          ))}
  
        </div>
  
        <div className="section-card">
  
          <h2>Recent Conversations</h2>
  
          <div className="conversation-item">
            <div>
              <strong>Rahul Sharma</strong>
              <p>Interested in Office Chair</p>
            </div>
            <span>2 min ago</span>
          </div>

          <div className="conversation-item">
            <div>
              <strong>Amit Kumar</strong>
              <p>Asked for product pricing</p>
            </div>
            <span>10 min ago</span>
          </div>

          <div className="conversation-item">
            <div>
              <strong>Priya Sharma</strong>
              <p>Wants to place an order</p>
            </div>
            <span>25 min ago</span>
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default Dashboard;