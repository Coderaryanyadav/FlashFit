"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string;
}

export function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-4">Size Guide</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="cm" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 bg-zinc-900">
                        <TabsTrigger value="cm">Centimeters (cm)</TabsTrigger>
                        <TabsTrigger value="in">Inches (in)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cm" className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-200 uppercase bg-zinc-900">
                                    <tr>
                                        <th className="px-6 py-3">Size</th>
                                        <th className="px-6 py-3">Chest</th>
                                        <th className="px-6 py-3">Length</th>
                                        <th className="px-6 py-3">Shoulder</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">S</td>
                                        <td className="px-6 py-4">106</td>
                                        <td className="px-6 py-4">71</td>
                                        <td className="px-6 py-4">53</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">M</td>
                                        <td className="px-6 py-4">112</td>
                                        <td className="px-6 py-4">73</td>
                                        <td className="px-6 py-4">55</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">L</td>
                                        <td className="px-6 py-4">118</td>
                                        <td className="px-6 py-4">75</td>
                                        <td className="px-6 py-4">57</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">XL</td>
                                        <td className="px-6 py-4">124</td>
                                        <td className="px-6 py-4">77</td>
                                        <td className="px-6 py-4">59</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-white">XXL</td>
                                        <td className="px-6 py-4">130</td>
                                        <td className="px-6 py-4">79</td>
                                        <td className="px-6 py-4">61</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="in" className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-200 uppercase bg-zinc-900">
                                    <tr>
                                        <th className="px-6 py-3">Size</th>
                                        <th className="px-6 py-3">Chest</th>
                                        <th className="px-6 py-3">Length</th>
                                        <th className="px-6 py-3">Shoulder</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">S</td>
                                        <td className="px-6 py-4">42</td>
                                        <td className="px-6 py-4">28</td>
                                        <td className="px-6 py-4">21</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">M</td>
                                        <td className="px-6 py-4">44</td>
                                        <td className="px-6 py-4">29</td>
                                        <td className="px-6 py-4">21.5</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">L</td>
                                        <td className="px-6 py-4">46</td>
                                        <td className="px-6 py-4">29.5</td>
                                        <td className="px-6 py-4">22.5</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-bold text-white">XL</td>
                                        <td className="px-6 py-4">49</td>
                                        <td className="px-6 py-4">30</td>
                                        <td className="px-6 py-4">23</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-white">XXL</td>
                                        <td className="px-6 py-4">51</td>
                                        <td className="px-6 py-4">31</td>
                                        <td className="px-6 py-4">24</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-4 p-4 bg-zinc-900 rounded-xl text-sm text-gray-400">
                    <p className="font-bold text-white mb-2">How to Measure:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li><span className="text-white">Chest:</span> Measure around the fullest part of your chest.</li>
                        <li><span className="text-white">Length:</span> Measure from the highest point of the shoulder to the hem.</li>
                        <li><span className="text-white">Shoulder:</span> Measure across the back from shoulder tip to shoulder tip.</li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
}
