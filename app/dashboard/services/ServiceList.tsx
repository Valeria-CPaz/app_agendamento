type Service = {
    id: string;
    name: string;
    priceCents: number;
    online?: boolean;
    active?: boolean;
};

type Props = {
    services: Service[];
};

// Render service list with name, price and status (active/inactive)
export default function ServiceList({ services }: Props) {
    if (services.length === 0) {
        return <div className="text-gray-500">Nenhum serviço cadastrado.</div>;
    }

    return (
        <table className="w-full border rounded">
            <thead>
                <tr className="bg-blue-600">
                    <th className="p-2 text-left text-white">Nome</th>
                    <th className="p-2 text-ritgh text-white">Preço</th>
                    <th className="p-2 text-center text-white">Ativo</th>
                </tr>
            </thead>
            <tbody>
                {services.map((service) => (
                    <tr key={service.id} className="border-t">
                        <td className="p-2">{service.name}</td>
                        <td className="p-2 text-center">
                            {formatBRL(service.priceCents)}
                        </td>
                        <td className="p-2 text-center">
                            {service.active ? "✅" : "❌"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// Helper to format value
function formatBRL(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
}