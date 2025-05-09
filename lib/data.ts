// This file would typically fetch data from a database
// For now, we'll use mock data

export type Player = {
  id: number
  username: string
  profilePicture: string
  joinDate: string
  rank: "Gold VIP" | "Silver VIP" | "Bronze VIP" | "Member"
}

export type VipTier = {
  id: string
  name: string
  price: number
  benefits: string[]
  image: string
}

export const vipTiers: VipTier[] = [
  {
    id: "bronze-vip",
    name: "Bronze VIP",
    price: 4,
    benefits: [
      "Early access to new minigames that will be launched in the future.",
      "10% discount on items in the server store.",
      "Access to exclusive kits.",
      "Prioritization in the entry queues for popular minigames.",
      "An exclusive Bronze emblem in the chat.",
    ],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "silver-vip",
    name: "Silver VIP",
    price: 7,
    benefits: [
      "All VIP Bronze advantages.",
      "20% discount on items in the server store.",
      "Access to exclusive kits.",
      "Access to an exclusive minigame only for Silver members.",
      "An exclusive Silver emblem in the chat.",
    ],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "gold-vip",
    name: "Gold VIP",
    price: 10,
    benefits: [
      "All VIP Silver advantages.",
      "50% discount on items in the server store.",
      "Daily rewards for logging in to the server.",
      "Access to an exclusive voice channel for Gold members.",
      "An exclusive Gold emblem in the chat.",
    ],
    image: "/placeholder.svg?height=200&width=200",
  },
]

export const players: Player[] = [
  {
    id: 1,
    username: "DiamondMiner42",
    profilePicture: "/placeholder.svg?height=100&width=100&text=DM",
    joinDate: "2023-01-15",
    rank: "Gold VIP",
  },
  {
    id: 2,
    username: "RedstoneWizard",
    profilePicture: "/placeholder.svg?height=100&width=100&text=RW",
    joinDate: "2023-02-20",
    rank: "Silver VIP",
  },
  {
    id: 3,
    username: "BuildMaster99",
    profilePicture: "/placeholder.svg?height=100&width=100&text=BM",
    joinDate: "2023-03-10",
    rank: "Bronze VIP",
  },
  {
    id: 4,
    username: "ExplorerKing",
    profilePicture: "/placeholder.svg?height=100&width=100&text=EK",
    joinDate: "2023-04-05",
    rank: "Member",
  },
  {
    id: 5,
    username: "CraftQueen",
    profilePicture: "/placeholder.svg?height=100&width=100&text=CQ",
    joinDate: "2023-05-12",
    rank: "Gold VIP",
  },
  {
    id: 6,
    username: "PvPChampion",
    profilePicture: "/placeholder.svg?height=100&width=100&text=PC",
    joinDate: "2023-06-18",
    rank: "Silver VIP",
  },
  {
    id: 7,
    username: "FarmingPro",
    profilePicture: "/placeholder.svg?height=100&width=100&text=FP",
    joinDate: "2023-07-22",
    rank: "Member",
  },
  {
    id: 8,
    username: "EnchantMaster",
    profilePicture: "/placeholder.svg?height=100&width=100&text=EM",
    joinDate: "2023-08-30",
    rank: "Bronze VIP",
  },
]
