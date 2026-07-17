import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

import { useQuery } from "@apollo/client/react";
import { Italic, Underline } from "lucide-react";
import { GetTypeDocument } from "~/graphql/generated";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import PokemonTypeBadge from "~/components/badge-type";
import React from "react";
import { useLocation, useNavigate } from "react-router";

export function FilterType() {
  const { data } = useQuery(GetTypeDocument, {});
  const [selectedType, setSelectedType] = React.useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectedTypes = (type: string) => {
    setSelectedType(type);
  };

  const handleApplyTypeFilter = () => {
    const params = new URLSearchParams(location.search);

    if (selectedType) {
      params.set("name", selectedType);
    } else {
      params.delete("name");
    }

    params.set("page", "1");

    navigate({
      pathname: location.pathname,
      search: `?${params.toString()}`,
    });
  };

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Filter</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter by Type</SheetTitle>
          <SheetDescription>
            Select the type of Pokémon you want to filter by.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <ToggleGroup className="flex flex-wrap" variant="outline" multiple>
            {data?.pokemon_v2_type.map((type) => (
              <ToggleGroupItem
                onClick={() => handleSelectedTypes(type.name)}
                className={
                  selectedType === type.name
                    ? `cursor-none opacity-10 border-none`
                    : `rounded-full border-none p-0 opacity-70 transition-all duration-200 hover:opacity-100 data-[state=on]:opacity-100 data-[state=on]:scale-105 data-[state=on]:ring-4 data-[state=on]:ring-primary/70 data-[state=on]:shadow-[0_0_0_2px_var(--color-background),0_0_18px_rgba(59,130,246,0.55)] data-[state=on]:brightness-125 data-[state=on]:saturate-200`
                }
                key={type.id}
                value={type.name}
                aria-label={type.name}
              >
                <PokemonTypeBadge typeName={type.name} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <SheetFooter>
          <Button onClick={handleApplyTypeFilter} type="button">
            Save changes
          </Button>
          <SheetClose render={<Button variant="outline">Close</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
