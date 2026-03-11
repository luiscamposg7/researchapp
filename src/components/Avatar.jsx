import { avatarPalette } from "../constants";

export default function Avatar({ name, index = 0, dark }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const p = avatarPalette[index % avatarPalette.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${dark ? p.d + " border-gray-800" : p.l + " border-white"}`}>
      {initials}
    </div>
  );
}
