"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState("general")

  const generalRules = [
    {
      id: "respect",
      title: "Respect All Players",
      content:
        "Treat all players with respect. Harassment, bullying, discrimination, or any form of hate speech will not be tolerated and may result in an immediate ban.",
    },
    {
      id: "chat",
      title: "Chat Etiquette",
      content:
        "Keep chat appropriate. Excessive swearing, spamming, or inappropriate topics are not allowed. English is the primary language in public chat.",
    },
    {
      id: "griefing",
      title: "No Griefing",
      content:
        "Destroying or modifying another player's build without permission is strictly prohibited. This includes stealing items, breaking blocks, or any form of vandalism.",
    },
    {
      id: "hacking",
      title: "No Hacking or Exploits",
      content:
        "The use of hacked clients, mods that provide unfair advantages, or exploiting bugs is not allowed. This includes X-ray texture packs, fly hacks, speed hacks, etc.",
    },
    {
      id: "advertising",
      title: "No Advertising",
      content: "Advertising other servers, websites, or services is not allowed without staff permission.",
    },
  ]

  const buildingRules = [
    {
      id: "distance",
      title: "Maintain Distance",
      content:
        "Keep a minimum distance of 100 blocks from other players' builds unless you have their permission to build closer.",
    },
    {
      id: "lag",
      title: "Lag-Inducing Builds",
      content:
        "Avoid creating builds that cause excessive lag. This includes massive redstone contraptions, entity farms with too many mobs, etc.",
    },
    {
      id: "claims",
      title: "Land Claims",
      content:
        "Use the land claim system to protect your builds. Unclaimed builds are not protected by staff against griefing.",
    },
    {
      id: "abandoned",
      title: "Abandoned Builds",
      content:
        "Builds that have been inactive for more than 30 days may be marked as abandoned and eventually removed to free up space.",
    },
    {
      id: "inappropriate",
      title: "Appropriate Content",
      content:
        "Do not build inappropriate or offensive structures. This includes inappropriate pixel art, symbols, or text.",
    },
  ]

  const pvpRules = [
    {
      id: "consent",
      title: "Consensual PvP",
      content: "PvP is only allowed if both parties agree to it. Forced PvP or spawn killing is not allowed.",
    },
    {
      id: "arenas",
      title: "PvP Arenas",
      content: "Designated PvP arenas are available for combat. All normal PvP rules apply in these areas.",
    },
    {
      id: "looting",
      title: "No Combat Looting",
      content: "Taking items from a player after killing them in PvP is not allowed unless agreed upon beforehand.",
    },
    {
      id: "trapping",
      title: "No Trapping",
      content: "Setting traps specifically to kill other players is not allowed outside of agreed-upon PvP scenarios.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Server Rules</h1>

      <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Private Java SMP Rules</CardTitle>
          <CardDescription>
            Please read and follow these rules to ensure a positive experience for everyone on the server. Failure to
            comply with these rules may result in warnings, temporary bans, or permanent bans depending on the severity
            and frequency of violations.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="building">Building</TabsTrigger>
              <TabsTrigger value="pvp">PvP</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6">
              <Accordion type="single" collapsible className="w-full">
                {generalRules.map((rule) => (
                  <AccordionItem key={rule.id} value={rule.id}>
                    <AccordionTrigger className="text-lg font-medium">{rule.title}</AccordionTrigger>
                    <AccordionContent className="text-gray-300">{rule.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="building" className="mt-6">
              <Accordion type="single" collapsible className="w-full">
                {buildingRules.map((rule) => (
                  <AccordionItem key={rule.id} value={rule.id}>
                    <AccordionTrigger className="text-lg font-medium">{rule.title}</AccordionTrigger>
                    <AccordionContent className="text-gray-300">{rule.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="pvp" className="mt-6">
              <Accordion type="single" collapsible className="w-full">
                {pvpRules.map((rule) => (
                  <AccordionItem key={rule.id} value={rule.id}>
                    <AccordionTrigger className="text-lg font-medium">{rule.title}</AccordionTrigger>
                    <AccordionContent className="text-gray-300">{rule.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
