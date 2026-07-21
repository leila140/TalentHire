import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { candidateService } from "@/services/candidate.service";
import type { CandidateFilters } from "@/types/candidate";

export function useCandidates(filters: CandidateFilters) {
  return useQuery({
    queryKey: ["candidates", filters],
    queryFn: () => candidateService.search(filters),
    placeholderData: keepPreviousData,
  });
}
