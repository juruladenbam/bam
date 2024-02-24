<?php

namespace App\Http\Controllers;

use App\Models\People;
use App\Models\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class SilsilahController extends Controller
{
    public function index()
    {

//         /*
//             apakah orang ini anaknya generasi ke n?
//             jika iya jadikan orang ini generasi ke n+1
//         */
//         $generation = Relation::all();


//         // $cek_anak = Relation::/*select('people_id','generation')->*/where('people_id',$generation[0]['people_id'])->first();
//         // $cek_ibu = Relation::/*select('people_id','generation')->*/where('people_id',$cek_anak->mother)->first();
//         // $cek_bapak = Relation::/*select('people_id','generation')->*/where('people_id',$cek_anak->father)->first();
//         // $cek_pasangan = Relation::/*select('people_id','generation')->*/where('people_id',$cek_anak->partner)->first();

// // return $cek_pasangan;
//         for($i=0; $i < count($generation); $i++){
//             $cek_anak = Relation::/*select('people_id','generation')->*/where('people_id',$generation[$i]['people_id'])->first();
//             $cek_ibu = Relation::/*select('people_id','generation')->*/where('people_id',$cek_anak->mother)->first();
//             $cek_bapak = Relation::/*select('people_id','generation')->*/where('people_id',$cek_anak->father)->first();
//             $cek_pasangan = Relation::/*select('people_id','generation')->*/where('people_id',$cek_anak->partner)->first();
//             // return $cek_ibu;

//             if($cek_ibu && $cek_bapak){
//                 if($cek_ibu->generation == 0 ||  $cek_bapak->generation == 0){
//                     if($generation[$i]['generation'] == null){
//                         $cek_anak->generation = 0;
//                         $cek_anak->save();
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." \n");
//                     }else{
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." pp\n");
//                     }
//                 }elseif($cek_ibu->generation == 1 ||  $cek_bapak->generation == 1){
//                     if($generation[$i]['generation'] == null){
//                         $cek_anak->generation = 1;
//                         $cek_anak->save();
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." \n");
//                     }else{
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." pp\n");
//                     }
//                 }elseif($cek_ibu->generation == 2 ||  $cek_bapak->generation == 2){
//                     if($generation[$i]['generation'] == null){
//                         $cek_anak->generation = 2;
//                         $cek_anak->save();
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." \n");
//                     }else{
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." pp\n");
//                     }
//                 }elseif($cek_ibu->generation == 3 ||  $cek_bapak->generation == 3){
//                     if($generation[$i]['generation'] == null){
//                         $cek_anak->generation = 3;
//                         $cek_anak->save();
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." \n");
//                     }else{
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." pp\n");
//                     }
//                 }elseif($cek_ibu->generation == 4 ||  $cek_bapak->generation == 4){
//                     if($generation[$i]['generation'] == null){
//                         $cek_anak->generation = 4;
//                         $cek_anak->save();
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." \n");
//                     }else{
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." pp\n");
//                     }
//                 }elseif($cek_ibu->generation == 5 ||  $cek_bapak->generation == 5){
//                     if($generation[$i]['generation'] == null){
//                         $cek_anak->generation = 5;
//                         $cek_anak->save();
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." \n");
//                     }else{
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." pp\n");
//                     }
//                 }elseif($cek_ibu->generation == 6 ||  $cek_bapak->generation == 6){
//                     if($generation[$i]['generation'] == null){
//                         $cek_anak->generation = 6;
//                         $cek_anak->save();
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." \n");
//                     }else{
//                         echo nl2br($generation[$i]['people_id']." - ".$generation[$i]['generation']." pp\n");
//                     }
//                 }else{
//                     echo nl2br("sini 1\n");
//                 }
//             }else{
//                 echo nl2br("sini 2\n");
//             }
//         }

        return view('index');
    }

    public function getData(Request $request)
    {
        $data1 = Relation::select(
            'relation.id_relation as id_relation',
            'relation.mother as mother_id',
            'rm.name as mother_name',
            'relation.father as father_id',
            'rf.name as father_name',
            'relation.people_id as people_id',
            'rp.name as people_name',
            'rp.gender as people_gender',
            'relation.partner as partner_id',
            'rpt.name as partner_name'
        )
        ->leftJoin('people as rm', 'relation.mother', '=', 'rm.id_people')
        ->leftJoin('people as rf', 'relation.father', '=', 'rf.id_people')
        ->leftJoin('people as rp', 'relation.people_id', '=', 'rp.id_people')
        ->leftJoin('people as rpt', 'relation.partner', '=', 'rpt.id_people')
        ->get();

        $data = Relation::select(
            'relation.id_relation',
            'relation.people_id',
            'p.name as people_name',
            'p.gender as people_gender',
            'relation.partner as partner_id'
        )
        ->leftJoin('people as p', 'relation.people_id', '=', 'p.id_people')
        ->get();
        return response()->json($data);
    }

    public function create()
    {
        return view('create');
    }

    public function getParent(Request $request)
    {
        $data = Relation::select(
            'relation.id_relation as id_relation',
            'relation.mother as mother_id',
            'rm.name as mother_name',
            'relation.father as father_id',
            'rf.name as father_name',
            'relation.people_id as people_id',
            'rp.name as people_name',
            'rp.gender as people_gender',
            'relation.partner as partner_id',
            'rpt.name as partner_name',
            'rpt.gender as partne_gender',
            'relation.status',
            'relation.number',
            'relation.generation',
        )
        ->leftJoin('people as rm', 'relation.mother', '=', 'rm.id_people')
        ->leftJoin('people as rf', 'relation.father', '=', 'rf.id_people')
        ->leftJoin('people as rp', 'relation.people_id', '=', 'rp.id_people')
        ->leftJoin('people as rpt', 'relation.partner', '=', 'rpt.id_people')
        ->where('relation.generation',$request->g)
        ->get();
        return response()->json($data);
    }

    public function getPeople(Request $request)
    {
        $data = People::where('name','like','%'.$request->name.'%')->limit(10)->get();
        return response()->json($data);
    }

    public function store(Request $request)
    {
        // return $request->all();
        $people_id = $request->people_id;
        $id_people = null;
        $partner_id = null;
        for ($i=0; $i < count($people_id); $i++) {

            if (!empty($people_id[$i])) {
                $id_people = $people_id[$i];
            } else {
                $people = new People;
                $people->name = $request->people_name[$i];
                $people->gender = $request->gender[$i];
                $people->save();
                $id_people = $people->id_people;
            }

            if (!empty($request->partner_id[$i])) {
                $partner_id = $request->partner_id[$i];
            } else {
                if(!empty($request->partner_name[$i])){
                    $partner = new People;
                    $partner->name = $request->partner_name[$i];
                    $partner->gender = $request->gender[$i] == 'male' ? 'female' : 'male';
                    $partner->save();
                    $partner_id = $partner->id_people;
                }
            }

            $relasi = new Relation;
            $relasi->mother = $request->mother;
            $relasi->father = $request->father;
            $relasi->people_id = $id_people;
            $relasi->partner = $partner_id;
            $relasi->number = $i+1;
            $relasi->generation = $request->pilih_generasi;
            $simpan_relasi = $relasi ->save();

            if($simpan_relasi && !empty($partner_id)){
                /*
                    apakah partner id (people_id) sudah ada di relasi
                        apakah partner id null
                        jika iya edit partner id
                    jika tidak tambahkan relasi normal
                */
                // $cekPartnerIDdiRelasi = Relation::where('people_id',$partner_id)->whereNull('partner')->first();
                // if($cekPartnerIDdiRelasi){
                //     $cekPartnerIDdiRelasi->partner = $id_people;
                //     $cekPartnerIDdiRelasi->save();
                // }else{
                    $relasi_partner = new Relation;
                    $relasi_partner->people_id = $partner_id;
                    $relasi_partner->partner = $id_people;
                    // $relasi_partner->number = $i+1;
                    $relasi_partner->generation = $request->pilih_generasi;
                    $relasi_partner->save();
                // }
            }
        }

        return redirect('/');
    }
}
