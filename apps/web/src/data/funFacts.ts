export const FUN_FACTS = [
  "Did you know, that you can open a bottle of beer with Jin's face???",
  "Marian HATES the small balls contained inside the protein bars. Why is this? Noone knows.",
  "JD after 8 years of working in Figure, does not know a single fun fact about Figure nor the people that work with him. What a shame... Yes.",
  "Every thursday, there is a lunch container cleanup in the kitchen - Alex swears that this is a fun fact...",
  "One story point does not equal one manday!(No matter what Krčma says or thinks.)",
  "Eating spicy food triggers an endorphin rush — the same brain chemicals released during exercise. Spice is basically a workout.",
  "Marián adds sriracha to bryndzové halušky. He did not try to seek professional help yet.",
  "Jin has a secret stash of Hershey's chocolate both iat homa and in the office.",
  "Honza Crha was actually not in Australia, but in Austria this whole time!",
  "People can die from inhaling gas from a lighter. These people are called gaslighters...",
  "Jakub actually keeps a collection of human hair. This helps him blow bigger bubbles with bublifuk.",
  "Dan H. - actually stands for Dan Hyundai.",
  "Sára actually tried caffeine once - she gained superspeed.",
  "Davis's father often calls Dávid DVD - His father's name is CD...",
  "Diana once won in a table football championship - She actually has more medals than Marián.",
  "Tereza was born to be a tester - The prophecy said that a true tesTerka will join our team.",
  "Andrejka once killed a man. The FBI is investigating this issue to this day...",
  "Lukáš owns a furry costume. He wears it when he walks his dog - to ensure a deeper connection.",
  "Imo does not have a mental condition.",
  "Veronika also likes cats.",
  "Patrik actually left Figure and never came back - this is a bad lookalike",
  "Roman can do a backflip on skateboard.",
  "Matej brutally murdered more than 3 flies. - this is not confirmed, yet he mourns this possibility every day.",
  "Dan Kohout does not wake up THAT early in spite of his name.",
  "Try to drink a glass of milk if these HOT facts are too hot for you! SOME people cannot comprehend the idea of drinking milk.",
  "Make it butter is a clever take on the popular phrase 'Make it better', where one letter is swapped! Who would have thought...",
  "Male pandas sometimes do handstands against trees to mark their territory higher. David can often be seen doing this",
    "Unlike most mammals, squirrels cannot burp or vomit."
] as const;

export function randomFunFact(seed: number): string {
  // Use the seed so the same reveal always picks the same fact within a session.
  return FUN_FACTS[seed % FUN_FACTS.length];
}