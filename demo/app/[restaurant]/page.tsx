import { notFound } from "next/navigation";
import { getRestaurant, RESTAURANTS } from "@/lib/restaurants";
import DemoClient from "@/components/DemoClient";

export function generateStaticParams() {
  return RESTAURANTS.map((r) => ({ restaurant: r.id }));
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}) {
  const { restaurant: id } = await params;
  const restaurant = getRestaurant(id);
  if (!restaurant) notFound();

  return <DemoClient restaurant={restaurant} allRestaurants={RESTAURANTS} />;
}
