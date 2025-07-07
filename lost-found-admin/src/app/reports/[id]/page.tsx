import ReportDetails from './ReportDetails';

export default function ReportPage({ params }: { params: { id: string } }) {
  return <ReportDetails reportId={params.id} />;
} 