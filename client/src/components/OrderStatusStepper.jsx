import React from 'react';
import { CheckCircle2, Clock, ChefHat, BellRing, PackageCheck, AlertCircle } from 'lucide-react';

const steps = [
  { id: 'Placed', label: 'Order Placed', icon: Clock },
  { id: 'Accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'Preparing', label: 'Preparing', icon: ChefHat },
  { id: 'Ready for Pickup', label: 'Ready for Pickup', icon: BellRing },
  { id: 'Completed', label: 'Collected', icon: PackageCheck },
];

export const OrderStatusStepper = ({ currentStatus }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-xs font-bold">
        <AlertCircle className="w-4 h-4 shrink-0" />
        Order has been cancelled.
      </div>
    );
  }

  if (currentStatus === 'Rejected') {
    return (
      <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center gap-2 text-xs font-bold">
        <AlertCircle className="w-4 h-4 shrink-0" />
        Order could not be accepted by MITS Canteen.
      </div>
    );
  }

  const normalizedStatus =
    currentStatus === 'Pending Acceptance'
      ? 'Placed'
      : currentStatus === 'Collected'
      ? 'Completed'
      : currentStatus;

  const currentIndex = steps.findIndex((s) => s.id === normalizedStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-3">
      {/* Stepper container */}
      <div className="relative flex items-center justify-between">
        {/* Background track */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-700/60 -translate-y-1/2 z-0"></div>

        {/* Progress track */}
        <div
          className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-[#7955E8] to-emerald-400 -translate-y-1/2 z-0 transition-all duration-700 ease-out"
          style={{
            width: `${(activeIdx / (steps.length - 1)) * 92}%`,
          }}
        ></div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isUpcoming = idx > activeIdx;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : isCurrent
                    ? step.id === 'Ready for Pickup'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20 animate-pulse'
                      : 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-lg shadow-purple-500/50 ring-4 ring-purple-500/30 animate-pulse'
                    : 'bg-[#151C30] border-2 border-slate-700 text-[#AAB3C5]'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>

              <span
                className={`mt-2 text-[10px] font-extrabold text-center max-w-[70px] leading-tight ${
                  isCurrent
                    ? step.id === 'Ready for Pickup'
                      ? 'text-emerald-400 font-black scale-105'
                      : 'text-purple-300 font-black scale-105'
                    : isDone
                    ? 'text-white'
                    : 'text-[#AAB3C5]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
