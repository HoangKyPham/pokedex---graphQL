import { useEffect, useRef, useState } from "react";
import { useDebounce } from "~/hooks/useDebounce";
import { Form, Link, Outlet, useNavigation, useSubmit } from "react-router";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Spinner } from "~/components/ui/spinner";
import type { Route } from "./+types/browse-layout";
import { GetPokemonDocument, SearchPokemonDocument, GetPokemonByTypeDocument } from "~/graphql/generated";
import { apolloClient } from "~/services/apollo-client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { BookmarkIcon } from "lucide-react";
import { FilterType } from "~/components/filter-type";
import { useLocation } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const name = url.searchParams.get("name");

  const limit = 20;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const offset = (page - 1) * limit;
  const { data } = q
    ? await apolloClient.query({
        query: SearchPokemonDocument,
        variables: { name: q ? `%${q}%` : "%%", limit, offset },
      })
    : name
    ? await apolloClient.query({
        query: GetPokemonByTypeDocument,
        variables: { typeName: name, limit, offset },
      })
    : await apolloClient.query({
        query: GetPokemonDocument,
        variables: { limit, offset },
      });

  

  const totalCount = data?.pokemon_v2_pokemon_aggregate?.aggregate?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  const pokemons = data?.pokemon_v2_pokemon || [];
  return { pokemons, q, page, totalCount, totalPages };
}

const BrowseLayout = ({ loaderData }: Route.ComponentProps) => {
  const { pokemons, q, page, totalCount, totalPages } = loaderData;
  const navigation = useNavigation();
  const location = useLocation();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");
  const isLastPage = page >= totalPages;
  const isFirstPage = page <= 1;

  const [query, setQuery] = useState(q || "");
  const debouncedQuery = useDebounce(query, 1000);

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  useEffect(() => {
    if (!formRef.current) return;

    const currentQuery = q || "";
    if (debouncedQuery === currentQuery) return;

    submit(formRef.current, {
      replace: currentQuery !== "",
    });
  }, [debouncedQuery, q, submit]);

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams(location.search);
    const safePage = Math.max(1, targetPage);

    if (q) params.set("q", q);
    params.set("page", String(safePage));

    return `?${params.toString()}`;
  };


  return (
    <>
      <div className="flex justify-between items-center gap-4 border-b border-gray-300 px-20 mb-10">
        <div className="">
          <img
            className="w-30 h-30 object-contain"
            src="https://vn.portal-pokemon.com/public_assets/images/logo.png"
            alt="logo"
          />
        </div>
        <div className="flex justify-center items-center gap-6">
          <Link to="/favourite" className="flex justify-center items-center gap-2 hover:cursor-pointer hover:underline hover:transform hover:scale-105 transition-all duration-100 ease-in-out hover:text-blue-600">
            <BookmarkIcon size={18} />
            <span>Favourite</span>
          </Link>
          <div className="grid w-full max-w-sm gap-4">
            <Form ref={formRef}>
              <InputGroup>
                <InputGroupInput
                  id="q"
                  name="q"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Searching..."
                />
                <InputGroupAddon align="inline-end">
                  <Spinner
                    className={`animate-spin ${!searching ? "hidden" : ""}`}
                  />
                </InputGroupAddon>
              </InputGroup>
            </Form>
          </div>
          <div className="">
            <FilterType  />
          </div>
        </div>
      </div>
      <Outlet context={{ pokemons, q }} />
      <Pagination className="mt-10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={buildPageHref(page - 1)}
              aria-disabled={isFirstPage}
              tabIndex={isFirstPage ? -1 : undefined}
              onClick={isFirstPage ? (e) => e.preventDefault() : undefined}
            />
          </PaginationItem>
          {(() => {
            const maxRenderedPages = 5;
            const startPage = Math.max(
              1,
              page - Math.floor(maxRenderedPages / 2),
            );
            const endPage = Math.min(
              totalPages,
              startPage + maxRenderedPages - 1,
            );
            const items = [];
            for (let i = startPage; i <= endPage; i++) {
              items.push(
                <PaginationItem key={i}>
                  <PaginationLink href={buildPageHref(i)} isActive={i === page}>
                    {i}
                  </PaginationLink>
                </PaginationItem>,
              );
            }
            return items;
          })()}

          <PaginationItem
            className={`${page < totalPages - 1 ? "" : "hidden"}`}
          >
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={isLastPage ? undefined : buildPageHref(page + 1)}
              aria-disabled={isLastPage}
              tabIndex={isLastPage ? -1 : undefined}
              onClick={isLastPage ? (e) => e.preventDefault() : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="mt-10"></div>
    </>
  );
};

export default BrowseLayout;
