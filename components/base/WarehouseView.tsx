
import React, { useState, useEffect } from 'react';
import { User, PurchaseRecord } from '../../types';
import { marketDatabase } from '../../services/marketDatabase';
import { Package, Clock, CheckCircle2, XCircle, Gift, ArrowRight } from 'lucide-react';

interface WarehouseViewProps {
    currentUser: User;
}

const WarehouseView: React.FC<WarehouseViewProps> = ({ currentUser }) => {
    const [myPurchases, setMyPurchases] = useState<PurchaseRecord[]>([]);

    useEffect(() => {
        const all = marketDatabase.getPurchases();
        setMyPurchases(all.filter(p => p.userId === currentUser.id));
    }, [currentUser.id]);

    return (
        <div className="h-full flex flex-col p-8 bg-slate-900/50">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Package size={28} className="text-indigo-400"/> Seu Armazém de Recompensas
                </h2>
                <p className="text-slate-400 mt-1">Gerencie aqui as conquistas e itens que você adquiriu no Mercado da Tribo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-6">
                {myPurchases.slice().reverse().map(pur => (
                    <div key={pur.id} className={`bg-slate-800 border-2 rounded-xl p-6 transition-all ${
                        pur.status === 'VALIDATED' ? 'border-green-500/30' : 
                        pur.status === 'CANCELLED' ? 'border-red-500/20 opacity-60' : 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                    }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${pur.status === 'VALIDATED' ? 'bg-green-900/20' : 'bg-slate-700'}`}>
                                <Gift size={24} className={pur.status === 'VALIDATED' ? 'text-green-400' : 'text-slate-400'}/>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                pur.status === 'VALIDATED' ? 'bg-green-900 text-green-400' : 
                                pur.status === 'CANCELLED' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'
                            }`}>
                                {pur.status === 'VALIDATED' ? 'RECEBIDO/USADO' : pur.status === 'CANCELLED' ? 'CANCELADO' : 'AGUARDANDO Board'}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{pur.itemName}</h3>
                        <p className="text-xs text-slate-500 mb-4">Adquirido em {new Date(pur.timestamp).toLocaleDateString()}</p>
                        
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex justify-between items-center">
                            <span className="text-xs text-slate-500 uppercase font-bold">Investimento</span>
                            <span className="text-sm font-mono text-yellow-400 font-bold">{pur.itemCost} Moedas</span>
                        </div>

                        {pur.status === 'PENDING' && (
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-yellow-500 font-bold uppercase animate-pulse">
                                <Clock size={12}/> Aguardando entrega física/real
                            </div>
                        )}
                        
                        {pur.status === 'VALIDATED' && (
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase">
                                <CheckCircle2 size={12}/> Recompensa efetivada com sucesso!
                            </div>
                        )}
                    </div>
                ))}

                {myPurchases.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                        <Package size={64} className="mb-4 opacity-10"/>
                        <p className="text-xl font-bold">Armazém Vazio</p>
                        <p className="text-sm">Visite o Mercado no Centro da Tribo para trocar suas moedas!</p>
                        <button className="mt-6 text-indigo-400 font-bold flex items-center gap-2 hover:text-indigo-300 transition-colors">
                            Ir para o Mercado <ArrowRight size={16}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarehouseView;
