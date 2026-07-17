import { BookmarkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import PokemonTypeBadge from "~/components/badge-type";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Toggle } from "~/components/ui/toggle";
import type { GetPokemonQuery, SearchPokemonQuery } from "~/graphql/generated";

type BrowseLayoutContext = {
  q: string | null;
  pokemons:
    | GetPokemonQuery["pokemon_v2_pokemon"]
    | SearchPokemonQuery["pokemon_v2_pokemon"];
};

const PokemonList = () => {
  const { pokemons } = useOutletContext<BrowseLayoutContext>();
  const [favouritePokemons, setFavouritePokemons] = useState<any[]>([]);

  useEffect(() => {
    const storedPokemons = window.localStorage.getItem("favouritePokemons");
    setFavouritePokemons(storedPokemons ? JSON.parse(storedPokemons) : []);
  }, []);

  const handleSetPokemonToLocalStorage = (pokemon: any) => {
    const storedPokemons = window.localStorage.getItem("favouritePokemons");
    const favouritePokemons = storedPokemons ? JSON.parse(storedPokemons) : [];
    favouritePokemons.push(pokemon);
    window.localStorage.setItem(
      "favouritePokemons",
      JSON.stringify(favouritePokemons),
    );
    setFavouritePokemons(favouritePokemons);
  };

  const handleRemovePokemonFromLocalStorage = (pokemonId: number) => {
    const storedPokemons = window.localStorage.getItem("favouritePokemons");
    const favouritePokemons = storedPokemons ? JSON.parse(storedPokemons) : [];
    const updatedPokemons = favouritePokemons.filter(
      (pokemon: any) => pokemon.id !== pokemonId,
    );
    window.localStorage.setItem(
      "favouritePokemons",
      JSON.stringify(updatedPokemons),
    );
    setFavouritePokemons(updatedPokemons);
  };

  return (
    <div className="grid grid-cols-4 gap-8 mx-30">
      {pokemons.map((pokemon) => {
        const rawSprites = pokemon.pokemon_v2_pokemonsprites[0]?.sprites;
        const spriteObj =
          typeof rawSprites === "string"
            ? JSON.parse(rawSprites)
            : (rawSprites as any);

        const imageUrl = spriteObj?.front_default || "";
        return (
          <Card
            key={pokemon.id}
            className="relative mx-auto w-full max-w-sm pt-0"
          >
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src={imageUrl}
              alt={pokemon.name}
              className="relative z-20 aspect-video w-full object-cover "
            />
            {/* <ToggleFavourite onClick={() => handleSetPokemonToLocalStorage(pokemon)} /> */}
            <Toggle
              data-pressed={favouritePokemons.some((p) => p.id === pokemon.id && p.isFavourite === true) ? "true" : "false"}
              aria-pressed={favouritePokemons.some((p) => p.id === pokemon.id && p.isFavourite === true) ? "true" : "false"}
              aria-label="Toggle bookmark"
              size="sm"
              variant="outline"
              onClick={() =>
                favouritePokemons.some((p) => p.id === pokemon.id)
                  ? handleRemovePokemonFromLocalStorage(pokemon.id)
                  : handleSetPokemonToLocalStorage({isFavourite: true, ...pokemon})
              }
              className="absolute top-2 right-2 z-40 rounded-full"
            >
              <BookmarkIcon className="group-aria-pressed/toggle:fill-foreground" />
            </Toggle>
            <CardHeader>
              <CardAction>
                {pokemon.pokemon_v2_pokemontypes.map((type, index) => {
                  const typeName = type.pokemon_v2_type?.name;
                  if (!typeName) return null;

                  return (
                    <PokemonTypeBadge
                      key={`${pokemon.id}-${typeName}-${index}`}
                      typeName={typeName}
                    />
                  );
                })}
              </CardAction>
              <CardTitle>{pokemon.name}</CardTitle>
              <CardDescription>Pokemon ID: {pokemon.id}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link className="w-full" to={`/pokemon/${pokemon.id}`}>
                <Button className="w-full">View Pokemon</Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default PokemonList;
