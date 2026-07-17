import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router";
import PokemonTypeBadge from "~/components/badge-type";
import { GetPokemonDetailDocument } from "~/graphql/generated";

const PokemonDetail = () => {
  const { id } = useParams();
  const numericId = Number(id);

  const { loading, error, data } = useQuery(GetPokemonDetailDocument, {
    variables: { id: numericId },
    skip: Number.isNaN(numericId),
  });

  if (Number.isNaN(numericId)) return <div>Invalid Pokemon ID.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const pokemon = data?.pokemon_v2_pokemon_by_pk;
  if (!pokemon) return <div>Pokemon not found.</div>;

  const rawSprites = pokemon.pokemon_v2_pokemonsprites[0]?.sprites;
  const spriteObj =
    typeof rawSprites === "string"
      ? JSON.parse(rawSprites)
      : (rawSprites as { front_default?: string } | null);
  const imageUrl = spriteObj?.front_default ?? "";
  const typeName =
    pokemon.pokemon_v2_pokemontypes[0]?.pokemon_v2_type?.name ?? "Unknown";

  return (
    <div className="overflow-hidden ">
      <div className="w-[90%] mx-auto flex justify-center items-center gap-4 border border-gray-300 rounded-lg p-4 shadow-lg">
        <div className="w-1/2 flex flex-col justify-center items-center gap-4">
          <img
            className="w-full h-full object-contain"
            src={imageUrl}
            alt={pokemon.name}
          />
          <h1 className="text-4xl">
            #{pokemon.id} {pokemon.name}
          </h1>
        </div>
        <div className="w-1/2 h-screen rounded-lg shadow-xl flex flex-col justify-center border px-4 items-start gap-10">
          <div className="flex flex-row gap-2">
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
          </div>
          <div className="">
            <h2 className="underline decoration-blue-600 font-bold text-2xl mb-5">
              Stats:
            </h2>
            <ul>
              {pokemon.pokemon_v2_pokemonstats.map((stat, index) => {
                const statName = stat.pokemon_v2_stat?.name;
                if (!statName) return null;

                return (
                  <li key={`${pokemon.id}-${statName}-${index}`}>
                    <span className="font-medium text-xl mr-2">
                      {statName}:
                    </span>
                    {stat.base_stat}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-10"></div>
    </div>
  );
};

export default PokemonDetail;
