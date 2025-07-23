"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { uploadImage } from "@/lib/blob"
import {
  Shield,
  Users,
  Crown,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  History,
  UserCheck,
  Settings,
  Plus,
  Package,
  DollarSign,
  ImageIcon,
  Pickaxe,
  Sword,
  Diamond,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import SafeImage from "@/components/safe-image"

type Player = {
  id: number
  username: string
  email: string
  rank: string
  profile_picture_url?: string
  created_at: string
  is_admin: boolean
}

type AdminAction = {
  id: number
  admin_username: string
  target_username: string
  action_type: string
  old_value: string
  new_value: string
  reason: string
  item_data?: any
  created_at: string
}

type ShopItem = {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  tier: string
  is_available: boolean
  created_at: string
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [players, setPlayers] = useState<Player[]>([])
  const [adminActions, setAdminActions] = useState<AdminAction[]>([])
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [newRank, setNewRank] = useState("")
  const [reason, setReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [loadingPlayers, setLoadingPlayers] = useState(true)
  const [loadingActions, setLoadingActions] = useState(true)
  const [loadingShopItems, setLoadingShopItems] = useState(true)

  // New item form state
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "VIP",
    tier: "bronze",
    image: null as File | null,
  })
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/")
      toast({
        title: "⛔ Access Denied",
        description: "You don't have permission to access the admin realm!",
        variant: "destructive",
      })
    }
  }, [user, isLoading, router, toast])

  // Fetch data
  useEffect(() => {
    if (user?.isAdmin) {
      fetchPlayers()
      fetchAdminActions()
      fetchShopItems()
    }
  }, [user])

  const fetchPlayers = async () => {
    try {
      setLoadingPlayers(true)
      const { data, error } = await supabase
        .from("users")
        .select("id, username, email, rank, profile_picture_url, created_at, is_admin")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching players:", error)
        toast({
          title: "⚠️ Error",
          description: "Failed to load players from the realm",
          variant: "destructive",
        })
        return
      }

      setPlayers(data || [])
    } catch (err) {
      console.error("Error fetching players:", err)
    } finally {
      setLoadingPlayers(false)
    }
  }

  const fetchAdminActions = async () => {
    try {
      setLoadingActions(true)
      const { data, error } = await supabase
        .from("admin_actions")
        .select(`
          id,
          action_type,
          old_value,
          new_value,
          reason,
          item_data,
          created_at,
          admin_user:admin_user_id(username),
          target_user:target_user_id(username)
        `)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error fetching admin actions:", error)
        return
      }

      const formattedActions =
        data?.map((action: any) => ({
          id: action.id,
          admin_username: action.admin_user?.username || "Unknown Admin",
          target_username: action.target_user?.username || "System",
          action_type: action.action_type,
          old_value: action.old_value,
          new_value: action.new_value,
          reason: action.reason,
          item_data: action.item_data,
          created_at: action.created_at,
        })) || []

      setAdminActions(formattedActions)
    } catch (err) {
      console.error("Error fetching admin actions:", err)
    } finally {
      setLoadingActions(false)
    }
  }

  const fetchShopItems = async () => {
    try {
      setLoadingShopItems(true)
      const { data, error } = await supabase.from("shop_items").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching shop items:", error)
        return
      }

      setShopItems(data || [])
    } catch (err) {
      console.error("Error fetching shop items:", err)
    } finally {
      setLoadingShopItems(false)
    }
  }

  const handleAssignVip = async () => {
    if (!selectedPlayer || !newRank || !user) return

    try {
      setIsUpdating(true)

      // Call the database function to assign VIP
      const { data, error } = await supabase.rpc("assign_vip_status", {
        target_user_id: selectedPlayer.id,
        vip_tier: newRank,
        admin_user_id: user.id,
        reason: reason || null,
      })

      if (error) {
        console.error("Error assigning VIP:", error)
        toast({
          title: "⚠️ Error",
          description: "Failed to assign VIP status",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "✅ VIP Assigned!",
        description: `Successfully granted ${newRank} to ${selectedPlayer.username}`,
        variant: "default",
      })

      // Refresh data
      await fetchPlayers()
      await fetchAdminActions()

      // Reset form
      setSelectedPlayer(null)
      setNewRank("")
      setReason("")
    } catch (err) {
      console.error("Error assigning VIP:", err)
      toast({
        title: "⚠️ Error",
        description: "An unexpected error occurred in the admin realm",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "⚠️ Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "⚠️ File Too Large",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setNewItem({ ...newItem, image: file })

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !user) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAddingItem(true)

      let imageUrl = "/placeholder.svg"

      // Upload image if provided
      if (newItem.image) {
        const filename = `shop-items/${Date.now()}-${newItem.image.name.replace(/\s+/g, "-")}`
        imageUrl = await uploadImage(newItem.image, filename)
      }

      // Add item to database
      const { data, error } = await supabase.rpc("add_shop_item", {
        item_name: newItem.name,
        item_description: newItem.description,
        item_price: Number.parseFloat(newItem.price),
        item_image_url: imageUrl,
        item_category: newItem.category,
        item_tier: newItem.tier,
        admin_user_id: user.id,
      })

      if (error) {
        console.error("Error adding item:", error)
        toast({
          title: "⚠️ Error",
          description: "Failed to add item to the shop",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "✅ Item Added!",
        description: `Successfully added ${newItem.name} to the shop`,
        variant: "default",
      })

      // Reset form and refresh data
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "VIP",
        tier: "bronze",
        image: null,
      })
      setImagePreview(null)
      setShowAddItemDialog(false)
      await fetchShopItems()
      await fetchAdminActions()
    } catch (err) {
      console.error("Error adding item:", err)
      toast({
        title: "⚠️ Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAddingItem(false)
    }
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Admin":
        return "bg-red-600 border-red-400"
      case "Gold VIP":
        return "bg-yellow-500 border-yellow-300"
      case "Silver VIP":
        return "bg-gray-400 border-gray-300"
      case "Bronze VIP":
        return "bg-amber-600 border-amber-400"
      default:
        return "bg-green-600 border-green-400"
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "assign_vip":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "add_shop_item":
        return <Package className="h-4 w-4 text-blue-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "bronze":
        return <Pickaxe className="h-4 w-4 text-amber-600" />
      case "silver":
        return <Sword className="h-4 w-4 text-gray-400" />
      case "gold":
        return <Diamond className="h-4 w-4 text-yellow-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center bg-gray-800 p-8 rounded-none minecraft-card border-4 border-green-500">
          <div className="w-16 h-16 bg-green-500/20 rounded-none flex items-center justify-center mb-4 minecraft-border border-2 border-green-500">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
          <p className="text-xl minecraft-text text-green-400">Loading Admin Realm...</p>
          <p className="text-sm minecraft-text text-gray-400 mt-2">Accessing the control panel...</p>
        </div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 bg-gray-800 p-4 sm:p-6 rounded-none minecraft-card border-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-none flex items-center justify-center minecraft-border border-2 border-red-500">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold minecraft-title text-red-400">Admin Control Panel</h1>
              <p className="text-sm minecraft-text text-gray-400">Master of the Minecraft Realm</p>
            </div>
          </div>
          <div className="flex-1"></div>
          <Badge className="bg-red-600 text-white minecraft-border rounded-none border-2 border-red-400">
            👑 {user.username}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="bg-gray-800 border-none minecraft-card border-4 border-blue-500 hover:border-blue-400 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 minecraft-text">Total Players</p>
                  <p className="text-xl sm:text-2xl font-bold minecraft-text text-blue-400">{players.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-none flex items-center justify-center minecraft-border border-2 border-blue-500">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-none minecraft-card border-4 border-yellow-500 hover:border-yellow-400 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 minecraft-text">VIP Players</p>
                  <p className="text-xl sm:text-2xl font-bold minecraft-text text-yellow-400">
                    {players.filter((p) => p.rank.includes("VIP")).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-none flex items-center justify-center minecraft-border border-2 border-yellow-500">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-none minecraft-card border-4 border-red-500 hover:border-red-400 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 minecraft-text">Admins</p>
                  <p className="text-xl sm:text-2xl font-bold minecraft-text text-red-400">
                    {players.filter((p) => p.is_admin).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-500/20 rounded-none flex items-center justify-center minecraft-border border-2 border-red-500">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-none minecraft-card border-4 border-purple-500 hover:border-purple-400 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 minecraft-text">Shop Items</p>
                  <p className="text-xl sm:text-2xl font-bold minecraft-text text-purple-400">{shopItems.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-none flex items-center justify-center minecraft-border border-2 border-purple-500">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 minecraft-border border-4 border-gray-600 rounded-none">
            <TabsTrigger
              value="players"
              className="minecraft-button rounded-none data-[state=active]:bg-green-700 data-[state=active]:text-white minecraft-text"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Player Management</span>
              <span className="sm:hidden">Players</span>
            </TabsTrigger>
            <TabsTrigger
              value="shop"
              className="minecraft-button rounded-none data-[state=active]:bg-blue-700 data-[state=active]:text-white minecraft-text"
            >
              <Package className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Shop Management</span>
              <span className="sm:hidden">Shop</span>
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="minecraft-button rounded-none data-[state=active]:bg-purple-700 data-[state=active]:text-white minecraft-text"
            >
              <History className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Action Logs</span>
              <span className="sm:hidden">Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Player Management Tab */}
          <TabsContent value="players" className="mt-6">
            <Card className="bg-gray-800 border-none minecraft-card border-4 border-green-500">
              <CardHeader>
                <CardTitle className="minecraft-text flex items-center gap-2 text-green-400">
                  <UserCheck className="h-5 w-5" />
                  Player Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search players in the realm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {loadingPlayers ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                      </div>
                    ) : (
                      filteredPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-700 rounded-none minecraft-border border-2 border-gray-600 hover:border-gray-500 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-none overflow-hidden minecraft-border border-2 border-gray-600">
                              {player.profile_picture_url ? (
                                <SafeImage
                                  src={player.profile_picture_url}
                                  alt={player.username}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                  fallbackText={player.username.substring(0, 2).toUpperCase()}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold text-sm">
                                  {player.username.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium minecraft-text truncate">{player.username}</p>
                              <p className="text-sm text-gray-400 minecraft-text truncate">{player.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Badge
                              className={`${getRankColor(player.rank)} text-white minecraft-border rounded-none border-2 flex-shrink-0`}
                            >
                              {player.rank}
                            </Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedPlayer(player)}
                                  className="bg-blue-600 hover:bg-blue-700 minecraft-button rounded-none border-2 border-blue-400"
                                >
                                  Manage
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-800 text-white border-none minecraft-card rounded-none border-4 border-blue-500 max-w-md mx-4">
                                <DialogHeader>
                                  <DialogTitle className="minecraft-text text-blue-400">
                                    Manage {selectedPlayer?.username}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="minecraft-text">Current Rank</Label>
                                    <Badge
                                      className={`${getRankColor(selectedPlayer?.rank || "")} text-white minecraft-border rounded-none ml-2 border-2`}
                                    >
                                      {selectedPlayer?.rank}
                                    </Badge>
                                  </div>

                                  <div>
                                    <Label htmlFor="newRank" className="minecraft-text">
                                      New Rank
                                    </Label>
                                    <Select value={newRank} onValueChange={setNewRank}>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2">
                                        <SelectValue placeholder="Select new rank" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-700 border-gray-600 minecraft-border rounded-none border-2">
                                        <SelectItem value="Member">Member</SelectItem>
                                        <SelectItem value="Bronze VIP">Bronze VIP</SelectItem>
                                        <SelectItem value="Silver VIP">Silver VIP</SelectItem>
                                        <SelectItem value="Gold VIP">Gold VIP</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="reason" className="minecraft-text">
                                      Reason (Optional)
                                    </Label>
                                    <Textarea
                                      id="reason"
                                      value={reason}
                                      onChange={(e) => setReason(e.target.value)}
                                      placeholder="Reason for rank change..."
                                      className="bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2"
                                    />
                                  </div>

                                  <Button
                                    onClick={handleAssignVip}
                                    disabled={!newRank || isUpdating}
                                    className="w-full bg-green-600 hover:bg-green-700 minecraft-button rounded-none border-2 border-green-400"
                                  >
                                    {isUpdating ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Update Rank
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Management Tab */}
          <TabsContent value="shop" className="mt-6">
            <div className="space-y-6">
              {/* Add Item Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold minecraft-text text-blue-400">Shop Management</h2>
                <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 minecraft-button rounded-none border-2 border-blue-400">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-white border-none minecraft-card rounded-none border-4 border-blue-500 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="minecraft-text text-blue-400">Add New Shop Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="itemName" className="minecraft-text">
                          Item Name *
                        </Label>
                        <Input
                          id="itemName"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          placeholder="Enter item name..."
                          className="bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="itemDescription" className="minecraft-text">
                          Description
                        </Label>
                        <Textarea
                          id="itemDescription"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          placeholder="Describe the item..."
                          className="bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="itemPrice" className="minecraft-text">
                            Price ($) *
                          </Label>
                          <Input
                            id="itemPrice"
                            type="number"
                            step="0.01"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            placeholder="0.00"
                            className="bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="itemTier" className="minecraft-text">
                            Tier
                          </Label>
                          <Select
                            value={newItem.tier}
                            onValueChange={(value) => setNewItem({ ...newItem, tier: value })}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600 minecraft-border rounded-none border-2">
                              <SelectItem value="bronze">Bronze</SelectItem>
                              <SelectItem value="silver">Silver</SelectItem>
                              <SelectItem value="gold">Gold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="itemCategory" className="minecraft-text">
                          Category
                        </Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 minecraft-border rounded-none minecraft-text border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600 minecraft-border rounded-none border-2">
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="Items">Items</SelectItem>
                            <SelectItem value="Kits">Kits</SelectItem>
                            <SelectItem value="Perks">Perks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="itemImage" className="minecraft-text">
                          Item Image
                        </Label>
                        <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-none p-4 hover:border-gray-500 transition-colors minecraft-border">
                          <label htmlFor="itemImage" className="cursor-pointer w-full">
                            {imagePreview ? (
                              <div className="relative w-full h-32">
                                <img
                                  src={imagePreview || "/placeholder.svg"}
                                  alt="Preview"
                                  className="w-full h-full object-contain rounded-none minecraft-border border-2 border-gray-600"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-4">
                                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400 minecraft-text">Click to upload image</p>
                                <p className="text-xs text-gray-500 mt-1 minecraft-text">PNG, JPG, GIF up to 5MB</p>
                              </div>
                            )}
                            <input
                              id="itemImage"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={isAddingItem}
                            />
                          </label>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddItem}
                        disabled={!newItem.name || !newItem.price || isAddingItem}
                        className="w-full bg-green-600 hover:bg-green-700 minecraft-button rounded-none border-2 border-green-400"
                      >
                        {isAddingItem ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Item...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item to Shop
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Shop Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingShopItems ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : shopItems.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 minecraft-text">No items in the shop yet</p>
                  </div>
                ) : (
                  shopItems.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-gray-800 border-none minecraft-card border-4 border-gray-600 hover:border-blue-500 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="relative w-full h-32 mb-4 rounded-none overflow-hidden minecraft-border border-2 border-gray-600">
                          <SafeImage
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            fallbackText={item.name}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold minecraft-text truncate">{item.name}</h3>
                            <div className="flex items-center gap-1">{getTierIcon(item.tier)}</div>
                          </div>
                          <p className="text-sm text-gray-400 minecraft-text line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="font-bold minecraft-text text-green-400">{item.price}</span>
                            </div>
                            <Badge
                              className={`${getRankColor(item.tier)} text-white minecraft-border rounded-none border-2`}
                            >
                              {item.tier}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="minecraft-text">{item.category}</span>
                            <span className="minecraft-text">{item.is_available ? "Available" : "Unavailable"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Action Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card className="bg-gray-800 border-none minecraft-card border-4 border-purple-500">
              <CardHeader>
                <CardTitle className="minecraft-text flex items-center gap-2 text-purple-400">
                  <History className="h-5 w-5" />
                  Admin Action Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {loadingActions ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    </div>
                  ) : adminActions.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 minecraft-text">No admin actions recorded yet</p>
                    </div>
                  ) : (
                    adminActions.map((action) => (
                      <div
                        key={action.id}
                        className="p-3 bg-gray-700 rounded-none minecraft-border border-2 border-gray-600 hover:border-gray-500 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getActionIcon(action.action_type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium minecraft-text">
                                {action.action_type === "assign_vip" && (
                                  <>
                                    {action.admin_username} assigned {action.new_value} to {action.target_username}
                                  </>
                                )}
                                {action.action_type === "add_shop_item" && (
                                  <>
                                    {action.admin_username} added "{action.new_value}" to the shop
                                  </>
                                )}
                              </p>
                              {action.action_type === "assign_vip" && (
                                <p className="text-sm text-gray-400 minecraft-text">
                                  Changed from {action.old_value} to {action.new_value}
                                </p>
                              )}
                              {action.item_data && (
                                <p className="text-sm text-gray-400 minecraft-text">
                                  Price: ${action.item_data.price} | Category: {action.item_data.category}
                                </p>
                              )}
                              {action.reason && (
                                <p className="text-sm text-gray-500 minecraft-text">Reason: {action.reason}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 minecraft-text flex-shrink-0">
                            {new Date(action.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
