import { Progress } from '../../components/ui/Progress';

export const UsageDisplay = ({ label, used, limit }: { label: string; used: number; limit: number }) => {
  const percentage = limit > 9999 ? 0 : (used / limit) * 100;
  const isUnlimited = limit > 9999;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{isUnlimited ? 'Unlimited' : `${used} / ${limit}`}</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
};
