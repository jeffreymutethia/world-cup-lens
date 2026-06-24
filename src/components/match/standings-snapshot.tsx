import type { Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb } from "lucide-react";

type StandingsSnapshotProps = {
  teams: Team[];
  group: string;
};

export function StandingsSnapshot({ teams, group }: StandingsSnapshotProps) {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Group {group} standings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">MP</TableHead>
              <TableHead className="text-right">GD</TableHead>
              <TableHead className="text-right">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{team.flag}</span>
                    <span className="font-medium">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-right font-semibold">0</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <Lightbulb className="size-4" />
            Insight
          </div>
          <p className="text-sm leading-6 text-amber-900">
            Group {group} is wide open. Early results could swing goal difference and qualification pressure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
