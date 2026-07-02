import Image from 'next/image'

type Baker = {
  id: string
  username: string
  display_name: string
  city: string
  bio: string | null
  avatar_url: string | null
  is_verified: boolean
}

export default function BakerCard({ baker }: { baker: Baker }) {
  return (
    <a
      href={`/${baker.username}`}
      className="block bg-white rounded-2xl shadow-sm border border-[#34565F]/10 overflow-hidden hover:shadow-md transition group"
    >
      <div className="relative h-28 bg-[#34565F]/5">
        {baker.avatar_url ? (
          <Image src={baker.avatar_url} alt={baker.display_name} fill className="object-cover" />
        ) : (
          <span className="flex items-center justify-center h-full text-5xl">👩‍🍳</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1">
          <h2 className="font-semibold text-[#22333B] group-hover:text-[#34565F] transition">
            {baker.display_name}
          </h2>
          {baker.is_verified && <span className="text-[#C4893D] text-sm">✓</span>}
        </div>
        <p className="text-[#34565F] text-xs mt-0.5">{baker.city}</p>
        {baker.bio && (
          <p className="text-[#22333B]/60 text-sm mt-2 line-clamp-2">{baker.bio}</p>
        )}
      </div>
    </a>
  )
}
