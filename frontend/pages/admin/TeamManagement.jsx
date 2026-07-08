import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import PendingApplications from '../../components/admin/PendingApplications';
import ApprovalTimeline from '../../components/admin/ApprovalTimeline';
import api from '../../api/applications';

const TeamManagement = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.getPending().then(res => setPendingCount(res.data.length));
  }, []);

  return (
    <div className="container mt-4">
      <h1>Team Management</h1>
      <Tabs defaultActiveKey="pending" className="mb-3">
        <Tab eventKey="pending" title={`Pending (${pendingCount})`}>
          <PendingApplications />
        </Tab>
        <Tab eventKey="timeline" title="Approval Timeline">
          <ApprovalTimeline />
        </Tab>
      </Tabs>
    </div>
  );
};

export default TeamManagement;
