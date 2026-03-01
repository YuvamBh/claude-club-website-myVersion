"use client";
import { TeamMember } from "../../../types/team";
import Tilt from "react-parallax-tilt";

export const TeamMemberCard = ({
  member,
}: {
  member: TeamMember;
  activeMember?: string | null;
  setActiveMember?: (id: string | null) => void;
}) => {
  const { name, position, image } = member;

  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.1}
      scale={1.03}
      transitionSpeed={400}
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      className="w-full h-full rounded-2xl"
    >
      <div
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
        style={{
          background: "var(--theme-card-bg)",
          border: "1px solid var(--theme-card-border)",
        }}
      >
        {/* Photo */}
        <div className="w-full aspect-square relative bg-black/10 overflow-hidden">
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              image.includes("claude.svg") ? "p-16 opacity-30" : ""
            }`}
          />
        </div>

        {/* Clean name tag below photo */}
        <div className="p-5 pt-4 text-center flex-1 flex flex-col justify-center">
          <h3
            className="text-lg font-bold mb-1"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {name}
          </h3>
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--theme-text-accent)", opacity: 0.9 }}
          >
            {position}
          </p>
        </div>
      </div>
    </Tilt>
  );
};
