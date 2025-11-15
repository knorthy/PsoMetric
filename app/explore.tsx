// app/explore.tsx
import { Redirect } from "expo-router";
// CORRECT PATH: only go up ONE level

export default function Explore() {
  return <Redirect href="/assessment" />;
}